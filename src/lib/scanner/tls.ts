import tls from "node:tls";

import ipaddr from "ipaddr.js";

import type { TlsResult } from "@/types/report";
import { resolvePublicHost, type ResolvedPublicAddress } from "@/lib/scanner/resolve-public-host";

const DEFAULT_TIMEOUT_MS = 5000;
const TLS_PORT = 443;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown TLS scanner error";
}

function formatCertificateName(name?: tls.DetailedPeerCertificate["subject"]) {
  if (!name) {
    return undefined;
  }

  return Object.entries(name)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

function daysUntil(dateValue?: string) {
  if (!dateValue) {
    return undefined;
  }

  const timestamp = Date.parse(dateValue);
  if (Number.isNaN(timestamp)) {
    return undefined;
  }

  return Math.ceil((timestamp - Date.now()) / 86_400_000);
}

function inspectAddress(host: string, address: ResolvedPublicAddress, timeoutMs: number) {
  return new Promise<TlsResult>((resolve, reject) => {
    const socket = tls.connect({
      host: address.address,
      port: TLS_PORT,
      servername: ipaddr.isValid(host) ? undefined : host,
      rejectUnauthorized: false
    });

    const close = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);
    socket.once("secureConnect", () => {
      const certificate = socket.getPeerCertificate();
      const validTo = certificate.valid_to;
      const expiration = daysUntil(validTo);
      const cipher = socket.getCipher();

      const result: TlsResult = {
        checked: true,
        valid: socket.authorized && (expiration === undefined || expiration >= 0),
        subject: formatCertificateName(certificate.subject),
        issuer: formatCertificateName(certificate.issuer),
        validFrom: certificate.valid_from,
        validTo,
        daysUntilExpiration: expiration,
        protocol: socket.getProtocol() ?? undefined,
        cipher: cipher?.name,
        error: socket.authorized ? undefined : socket.authorizationError?.toString()
      };

      close();
      resolve(result);
    });
    socket.once("timeout", () => {
      close();
      reject(new Error("TLS connection timed out"));
    });
    socket.once("error", (error) => {
      close();
      reject(error);
    });
  });
}

export async function scanTls(host: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<TlsResult> {
  let addresses: ResolvedPublicAddress[];

  try {
    addresses = (await resolvePublicHost(host)).addresses;
  } catch (error) {
    return { checked: true, valid: false, error: errorMessage(error) };
  }

  let lastError = "TLS connection failed";

  for (const address of addresses) {
    try {
      return await inspectAddress(host, address, timeoutMs);
    } catch (error) {
      lastError = errorMessage(error);
    }
  }

  return { checked: true, valid: false, error: lastError };
}
