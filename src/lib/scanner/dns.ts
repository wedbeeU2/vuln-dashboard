import { Resolver, resolve4, resolve6, resolveCname, resolveMx, resolveNs, resolveSoa, resolveTxt } from "node:dns/promises";
import type { MxRecord, SoaRecord } from "node:dns";

import type { DnsResult } from "@/types/report";

export type DnsResolver = {
  resolve4: (host: string) => Promise<string[]>;
  resolve6: (host: string) => Promise<string[]>;
  resolveCname: (host: string) => Promise<string[]>;
  resolveMx: (host: string) => Promise<MxRecord[]>;
  resolveNs: (host: string) => Promise<string[]>;
  resolveSoa: (host: string) => Promise<SoaRecord>;
  resolveTxt: (host: string) => Promise<string[][]>;
};

type RecordCollector = {
  type: string;
  collect: (resolver: DnsResolver, host: string) => Promise<string[]>;
};

const DEFAULT_FALLBACK_DNS_SERVERS = ["1.1.1.1", "8.8.8.8"];
const RETRYABLE_DNS_CODES = new Set(["ECONNREFUSED", "ETIMEOUT", "ESERVFAIL", "EAI_AGAIN", "EDESTRUCTION"]);

const systemResolver: DnsResolver = {
  resolve4,
  resolve6,
  resolveCname,
  resolveMx,
  resolveNs,
  resolveSoa,
  resolveTxt
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown DNS error";
}

const COLLECTORS: RecordCollector[] = [
  { type: "A", collect: (resolver, host) => resolver.resolve4(host) },
  { type: "AAAA", collect: (resolver, host) => resolver.resolve6(host) },
  { type: "CNAME", collect: (resolver, host) => resolver.resolveCname(host) },
  {
    type: "MX",
    collect: async (resolver, host) => (await resolver.resolveMx(host)).map((record) => `${record.priority} ${record.exchange}`)
  },
  { type: "NS", collect: (resolver, host) => resolver.resolveNs(host) },
  { type: "TXT", collect: async (resolver, host) => (await resolver.resolveTxt(host)).map((record) => record.join("")) },
  {
    type: "SOA",
    collect: async (resolver, host) => {
      const record = await resolver.resolveSoa(host);
      return [
        `nsname=${record.nsname}`,
        `hostmaster=${record.hostmaster}`,
        `serial=${record.serial}`,
        `refresh=${record.refresh}`,
        `retry=${record.retry}`,
        `expire=${record.expire}`,
        `minttl=${record.minttl}`
      ];
    }
  }
];

export function parseDnsServers(value = process.env.SCAN_DNS_SERVERS) {
  return (value ?? "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
}

function createResolver(servers: string[]): DnsResolver {
  const resolver = new Resolver();
  resolver.setServers(servers);
  return resolver;
}

function configuredResolvers() {
  const configuredServers = parseDnsServers();

  if (configuredServers.length > 0) {
    return configuredServers.map((server) => createResolver([server]));
  }

  return [systemResolver, ...DEFAULT_FALLBACK_DNS_SERVERS.map((server) => createResolver([server]))];
}

function isRetryableDnsError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? (error as { code?: unknown }).code : undefined;
  return typeof code === "string" && RETRYABLE_DNS_CODES.has(code);
}

async function collectWithFallback(
  { collect }: RecordCollector,
  host: string,
  resolvers: DnsResolver[]
): Promise<string[]> {
  let lastError: unknown;

  for (let index = 0; index < resolvers.length; index += 1) {
    try {
      return await collect(resolvers[index], host);
    } catch (error) {
      lastError = error;

      if (!isRetryableDnsError(error) || index === resolvers.length - 1) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function collectDnsRecords(host: string, resolvers = configuredResolvers()): Promise<DnsResult> {
  const result: DnsResult = { records: {}, errors: {} };

  await Promise.all(
    COLLECTORS.map(async (collector) => {
      try {
        result.records[collector.type] = await collectWithFallback(collector, host, resolvers);
      } catch (error) {
        result.records[collector.type] = [];
        result.errors[collector.type] = errorMessage(error);
      }
    })
  );

  return result;
}

export async function scanDns(host: string): Promise<DnsResult> {
  return collectDnsRecords(host);
}
