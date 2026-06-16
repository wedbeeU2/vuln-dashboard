import { beforeEach, describe, expect, it, vi } from "vitest";

import { scanDns } from "@/lib/scanner/dns";
import { scanHeaders } from "@/lib/scanner/headers";
import { scanCommonPorts } from "@/lib/scanner/ports";
import { normalizeTarget } from "@/lib/scanner/target";
import { scanTls } from "@/lib/scanner/tls";
import { runSecurityScan } from "@/lib/scanner/run-scan";

vi.mock("@/lib/scanner/dns", () => ({
  scanDns: vi.fn()
}));

vi.mock("@/lib/scanner/headers", () => ({
  scanHeaders: vi.fn()
}));

vi.mock("@/lib/scanner/ports", () => ({
  scanCommonPorts: vi.fn()
}));

vi.mock("@/lib/scanner/target", () => ({
  normalizeTarget: vi.fn()
}));

vi.mock("@/lib/scanner/tls", () => ({
  scanTls: vi.fn()
}));

const scanDnsMock = vi.mocked(scanDns);
const scanHeadersMock = vi.mocked(scanHeaders);
const scanCommonPortsMock = vi.mocked(scanCommonPorts);
const normalizeTargetMock = vi.mocked(normalizeTarget);
const scanTlsMock = vi.mocked(scanTls);

describe("runSecurityScan", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    normalizeTargetMock.mockReturnValue({
      kind: "domain",
      input: "https://user:pass@example.com/path?token=secret",
      host: "example.com"
    });
    scanDnsMock.mockResolvedValue({ records: {}, errors: {} });
    scanTlsMock.mockResolvedValue({ checked: true, valid: true, daysUntilExpiration: 90 });
    scanHeadersMock.mockResolvedValue([
      { url: "https://example.com", status: 200, present: {}, missing: [], warnings: [] }
    ]);
    scanCommonPortsMock.mockResolvedValue([]);
  });

  it("stores and scans the normalized host instead of raw user input", async () => {
    const report = await runSecurityScan("https://user:pass@example.com/path?token=secret");

    expect(report.target).toBe("example.com");
    expect(report.normalizedTarget).toBe("example.com");
    expect(scanDnsMock).toHaveBeenCalledWith("example.com");
    expect(scanTlsMock).toHaveBeenCalledWith("example.com");
    expect(scanHeadersMock).toHaveBeenCalledWith("example.com");
    expect(scanCommonPortsMock).toHaveBeenCalledWith("example.com");
  });
});
