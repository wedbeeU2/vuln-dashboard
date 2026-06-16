import ipaddr from "ipaddr.js";

export type NormalizedTarget = {
  kind: "domain" | "ip";
  input: string;
  host: string;
};

const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function hostFromInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Enter a valid public domain or IP address");
  }

  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `scan://${trimmed}`);
    return url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  } catch {
    throw new Error("Enter a valid public domain or IP address");
  }
}

function assertPublicIp(host: string) {
  const parsed = ipaddr.parse(host);
  const range = parsed.range();
  const blocked = new Set([
    "unspecified",
    "broadcast",
    "multicast",
    "linkLocal",
    "loopback",
    "private",
    "reserved",
    "carrierGradeNat",
    "uniqueLocal"
  ]);

  if (blocked.has(range)) {
    throw new Error("Local and private targets are not allowed");
  }
}

export function normalizeTarget(input: string): NormalizedTarget {
  const host = hostFromInput(input);

  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new Error("Local and private targets are not allowed");
  }

  if (ipaddr.isValid(host)) {
    assertPublicIp(host);
    return { kind: "ip", input, host };
  }

  if (!DOMAIN_PATTERN.test(host)) {
    throw new Error("Enter a valid public domain or IP address");
  }

  return { kind: "domain", input, host };
}
