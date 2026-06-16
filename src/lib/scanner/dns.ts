import { resolve4, resolve6, resolveCname, resolveMx, resolveNs, resolveSoa, resolveTxt } from "node:dns/promises";

import type { DnsResult } from "@/types/report";

type RecordCollector = {
  type: string;
  collect: (host: string) => Promise<string[]>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown DNS error";
}

const COLLECTORS: RecordCollector[] = [
  { type: "A", collect: (host) => resolve4(host) },
  { type: "AAAA", collect: (host) => resolve6(host) },
  { type: "CNAME", collect: (host) => resolveCname(host) },
  {
    type: "MX",
    collect: async (host) => (await resolveMx(host)).map((record) => `${record.priority} ${record.exchange}`)
  },
  { type: "NS", collect: (host) => resolveNs(host) },
  { type: "TXT", collect: async (host) => (await resolveTxt(host)).map((record) => record.join("")) },
  {
    type: "SOA",
    collect: async (host) => {
      const record = await resolveSoa(host);
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

export async function scanDns(host: string): Promise<DnsResult> {
  const result: DnsResult = { records: {}, errors: {} };

  await Promise.all(
    COLLECTORS.map(async ({ type, collect }) => {
      try {
        result.records[type] = await collect(host);
      } catch (error) {
        result.records[type] = [];
        result.errors[type] = errorMessage(error);
      }
    })
  );

  return result;
}
