import http from "node:http";
import https from "node:https";
import type { LookupAddress, LookupAllOptions, LookupOneOptions } from "node:dns";

import ipaddr from "ipaddr.js";

import type { HeaderResult } from "@/types/report";
import { resolvePublicHost, type ResolvedPublicAddress } from "@/lib/scanner/resolve-public-host";

const DEFAULT_TIMEOUT_MS = 5000;
const SECURITY_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy"
];

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown header scanner error";
}

function headerLabel(header: string) {
  return header
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join("-");
}

function normalizeHeaderValue(value: number | string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value?.toString();
}

function formatUrl(protocol: "http" | "https", host: string) {
  const displayHost = ipaddr.isValid(host) && ipaddr.parse(host).kind() === "ipv6" ? `[${host}]` : host;
  return `${protocol}://${displayHost}`;
}

function buildLookup(addresses: ResolvedPublicAddress[]) {
  return (
    hostname: string,
    options: LookupOneOptions | LookupAllOptions,
    callback: (error: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void
  ) => {
    const family = "family" in options ? options.family : undefined;
    const matches = family ? addresses.filter((address) => address.family === family) : addresses;
    const selected = matches[0] ?? addresses[0];

    if ("all" in options && options.all) {
      callback(
        null,
        matches.map((address) => ({ address: address.address, family: address.family }))
      );
      return;
    }

    callback(null, selected.address, selected.family);
  };
}

function inspectHeaders(url: string, protocol: "http" | "https", host: string, addresses: ResolvedPublicAddress[], timeoutMs: number) {
  return new Promise<HeaderResult>((resolve) => {
    const client = protocol === "https" ? https : http;
    const Agent = protocol === "https" ? https.Agent : http.Agent;
    const request = client.request(
      {
        hostname: host,
        port: protocol === "https" ? 443 : 80,
        path: "/",
        method: "GET",
        agent: new Agent({ lookup: buildLookup(addresses) }),
        headers: {
          Host: host,
          "User-Agent": "vuln-dashboard-scanner/1.0"
        },
        timeout: timeoutMs
      },
      (response) => {
        response.resume();
        response.once("end", () => {
          const present: Record<string, string> = {};
          const missing: string[] = [];
          const warnings: string[] = [];

          for (const header of SECURITY_HEADERS) {
            const value = normalizeHeaderValue(response.headers[header]);

            if (value) {
              present[headerLabel(header)] = value;
            } else {
              missing.push(headerLabel(header));
            }
          }

          if (protocol === "https" && !present["Strict-Transport-Security"]) {
            warnings.push("HTTPS response is missing Strict-Transport-Security");
          }

          if (!present["Content-Security-Policy"]) {
            warnings.push("Response is missing Content-Security-Policy");
          }

          if (!present["X-Content-Type-Options"]) {
            warnings.push("Response is missing X-Content-Type-Options");
          }

          resolve({ url, status: response.statusCode, present, missing, warnings });
        });
      }
    );

    request.once("timeout", () => {
      request.destroy(new Error("Header request timed out"));
    });
    request.once("error", (error) => {
      resolve({ url, present: {}, missing: SECURITY_HEADERS.map(headerLabel), warnings: [], error: errorMessage(error) });
    });
    request.end();
  });
}

export async function scanHeaders(host: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<HeaderResult[]> {
  let addresses: ResolvedPublicAddress[];

  try {
    addresses = (await resolvePublicHost(host)).addresses;
  } catch (error) {
    const message = errorMessage(error);

    return [
      { url: formatUrl("https", host), present: {}, missing: SECURITY_HEADERS.map(headerLabel), warnings: [], error: message },
      { url: formatUrl("http", host), present: {}, missing: SECURITY_HEADERS.map(headerLabel), warnings: [], error: message }
    ];
  }

  return Promise.all([
    inspectHeaders(formatUrl("https", host), "https", host, addresses, timeoutMs),
    inspectHeaders(formatUrl("http", host), "http", host, addresses, timeoutMs)
  ]);
}
