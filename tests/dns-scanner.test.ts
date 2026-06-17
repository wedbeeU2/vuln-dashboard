import { describe, expect, it, vi } from "vitest";

import { collectDnsRecords, parseDnsServers, type DnsResolver } from "@/lib/scanner/dns";

function dnsError(code: string, message = code) {
  return Object.assign(new Error(message), { code });
}

function resolver(overrides: Partial<DnsResolver> = {}): DnsResolver {
  return {
    resolve4: vi.fn().mockRejectedValue(dnsError("ENODATA")),
    resolve6: vi.fn().mockRejectedValue(dnsError("ENODATA")),
    resolveCname: vi.fn().mockRejectedValue(dnsError("ENODATA")),
    resolveMx: vi.fn().mockRejectedValue(dnsError("ENODATA")),
    resolveNs: vi.fn().mockRejectedValue(dnsError("ENODATA")),
    resolveSoa: vi.fn().mockRejectedValue(dnsError("ENODATA")),
    resolveTxt: vi.fn().mockRejectedValue(dnsError("ENODATA")),
    ...overrides
  };
}

describe("scanDns", () => {
  it("falls back to the next resolver when record lookups are refused", async () => {
    const defaultResolver = resolver({
      resolve4: vi.fn().mockRejectedValue(dnsError("ECONNREFUSED", "queryA ECONNREFUSED scanme.nmap.org"))
    });
    const fallbackResolver = resolver({
      resolve4: vi.fn().mockResolvedValue(["45.33.32.156"])
    });

    const result = await collectDnsRecords("scanme.nmap.org", [defaultResolver, fallbackResolver]);

    expect(defaultResolver.resolve4).toHaveBeenCalledWith("scanme.nmap.org");
    expect(fallbackResolver.resolve4).toHaveBeenCalledWith("scanme.nmap.org");
    expect(result.records.A).toEqual(["45.33.32.156"]);
    expect(result.errors.A).toBeUndefined();
  });

  it("retries resolver destruction errors from a fallback resolver", async () => {
    const defaultResolver = resolver({
      resolve4: vi.fn().mockRejectedValue(dnsError("ECONNREFUSED", "queryA ECONNREFUSED scanme.nmap.org"))
    });
    const canceledResolver = resolver({
      resolve4: vi.fn().mockRejectedValue(dnsError("EDESTRUCTION", "queryA EDESTRUCTION scanme.nmap.org"))
    });
    const fallbackResolver = resolver({
      resolve4: vi.fn().mockResolvedValue(["45.33.32.156"])
    });

    const result = await collectDnsRecords("scanme.nmap.org", [defaultResolver, canceledResolver, fallbackResolver]);

    expect(canceledResolver.resolve4).toHaveBeenCalledWith("scanme.nmap.org");
    expect(fallbackResolver.resolve4).toHaveBeenCalledWith("scanme.nmap.org");
    expect(result.records.A).toEqual(["45.33.32.156"]);
  });

  it("does not retry authoritative no-data responses", async () => {
    const defaultResolver = resolver();
    const fallbackResolver = resolver({
      resolveMx: vi.fn().mockResolvedValue(["10 mail.scanme.nmap.org"])
    });

    const result = await collectDnsRecords("scanme.nmap.org", [defaultResolver, fallbackResolver]);

    expect(fallbackResolver.resolveMx).not.toHaveBeenCalled();
    expect(result.records.MX).toEqual([]);
    expect(result.errors.MX).toBe("ENODATA");
  });

  it("parses configured DNS servers from comma-separated environment values", () => {
    expect(parseDnsServers("1.1.1.1, 8.8.8.8 ,,")).toEqual(["1.1.1.1", "8.8.8.8"]);
  });
});
