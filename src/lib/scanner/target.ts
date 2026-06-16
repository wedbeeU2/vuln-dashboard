import ipaddr from "ipaddr.js";

export type NormalizedTarget = {
  kind: "domain" | "ip";
  input: string;
  host: string;
};

const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

const DENIED_DOMAIN_SUFFIXES = ["local", "localhost", "test", "invalid", "example"];

function hostFromInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Enter a valid public domain or IP address");
  }

  if (ipaddr.isValid(trimmed)) {
    return ipaddr.parse(trimmed).toString().toLowerCase();
  }

  if (!trimmed.includes("://") && trimmed.includes("@")) {
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
  const address =
    parsed instanceof ipaddr.IPv6 && parsed.isIPv4MappedAddress() ? parsed.toIPv4Address() : parsed;
  const range = address.range();

  if (range !== "unicast") {
    throw new Error("Local and private targets are not allowed");
  }
}

function hasDeniedDomainSuffix(host: string) {
  return DENIED_DOMAIN_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

export function normalizeTarget(input: string): NormalizedTarget {
  const host = hostFromInput(input);

  if (hasDeniedDomainSuffix(host)) {
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
