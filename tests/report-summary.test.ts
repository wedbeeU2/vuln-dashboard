import { describe, expect, it } from "vitest";
import { summarizeReport } from "@/lib/report/summary";
import type { SecurityReport } from "@/types/report";

function baseReport(overrides: Partial<SecurityReport> = {}): SecurityReport {
  return {
    target: "example.com",
    normalizedTarget: "example.com",
    scannedAt: "2026-06-16T00:00:00.000Z",
    riskScore: 0,
    summary: "",
    ports: [],
    tls: { checked: true, valid: true, daysUntilExpiration: 90 },
    headers: [{ url: "https://example.com", present: {}, missing: [], warnings: [] }],
    dns: { records: {}, errors: {} },
    recommendations: [],
    ...overrides
  };
}

describe("summarizeReport", () => {
  it("raises risk for risky open ports and missing headers", () => {
    const report = summarizeReport(
      baseReport({
        ports: [{ port: 6379, service: "Redis", status: "open" }],
        headers: [
          { url: "https://example.com", present: {}, missing: ["content-security-policy"], warnings: [] }
        ]
      })
    );

    expect(report.riskScore).toBe(40);
    expect(report.recommendations).toContain("Review exposed Redis access and restrict it to trusted networks.");
    expect(report.summary).toContain("Review recommended");
  });

  it("raises risk for expired certificates", () => {
    const report = summarizeReport(baseReport({ tls: { checked: true, valid: false, daysUntilExpiration: -3 } }));

    expect(report.riskScore).toBeGreaterThanOrEqual(30);
    expect(report.recommendations).toContain("Renew or replace the TLS certificate.");
  });

  it("raises expired certificate risk even when TLS validity is true", () => {
    const report = summarizeReport(baseReport({ tls: { checked: true, valid: true, daysUntilExpiration: -3 } }));

    expect(report.riskScore).toBeGreaterThanOrEqual(30);
    expect(report.recommendations).toContain("Renew or replace the TLS certificate.");
  });
});
