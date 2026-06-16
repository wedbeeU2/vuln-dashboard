import { lookup } from "node:dns/promises";

import ipaddr from "ipaddr.js";

import { assertPublicIpAddress } from "@/lib/scanner/target";

export type ResolvedPublicAddress = {
  address: string;
  family: 4 | 6;
};

export type PublicHostResolver = (host: string) => Promise<ResolvedPublicAddress[]>;

const NON_PUBLIC_RESOLUTION_ERROR = "Target resolved to a non-public address";

async function defaultResolver(host: string): Promise<ResolvedPublicAddress[]> {
  const addresses = await lookup(host, { all: true, verbatim: false });

  return addresses.map(({ address, family }) => ({
    address,
    family: family === 6 ? 6 : 4
  }));
}

function addressFamily(address: string): 4 | 6 {
  return ipaddr.parse(address).kind() === "ipv6" ? 6 : 4;
}

function assertResolvedAddressIsPublic(address: string) {
  if (!ipaddr.isValid(address)) {
    throw new Error(NON_PUBLIC_RESOLUTION_ERROR);
  }

  try {
    assertPublicIpAddress(address);
  } catch {
    throw new Error(NON_PUBLIC_RESOLUTION_ERROR);
  }
}

export async function resolvePublicHost(
  host: string,
  resolver: PublicHostResolver = defaultResolver
): Promise<{ host: string; addresses: ResolvedPublicAddress[] }> {
  if (ipaddr.isValid(host)) {
    assertResolvedAddressIsPublic(host);
    return { host, addresses: [{ address: host, family: addressFamily(host) }] };
  }

  const addresses = await resolver(host);

  if (addresses.length === 0) {
    throw new Error("Target did not resolve to an address");
  }

  for (const { address } of addresses) {
    assertResolvedAddressIsPublic(address);
  }

  return { host, addresses };
}
