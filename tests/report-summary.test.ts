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
          { url: "https://example.com", status: 200, present: {}, missing: ["content-security-policy"], warnings: [] }
        ]
      })
    );

    expect(report.riskScore).toBe(43);
    expect(report.recommendations).toContain("Review exposed Redis access and restrict it to trusted networks.");
    expect(report.summary).toContain("Review recommended");
  });

  it("does not raise risk for normal public web ports by themselves", () => {
    const report = summarizeReport(
      baseReport({
        ports: [
          { port: 80, service: "HTTP", status: "open" },
          { port: 443, service: "HTTPS", status: "open" },
          { port: 8080, service: "HTTP alternate", status: "open" },
          { port: 8443, service: "HTTPS alternate", status: "open" }
        ]
      })
    );

    expect(report.riskScore).toBe(0);
    expect(report.summary).toBe("No urgent issues found in the v1 checks.");
  });

  it("raises review-level risk for exposed FTP", () => {
    const report = summarizeReport(
      baseReport({
        ports: [{ port: 21, service: "FTP", status: "open" }]
      })
    );

    expect(report.riskScore).toBe(25);
    expect(report.summary).toContain("Review recommended");
    expect(report.recommendations).toContain("Review exposed FTP access and prefer secure transfer methods.");
  });

  it("deduplicates successful missing header findings and caps their score", () => {
    const missing = [
      "content-security-policy",
      "strict-transport-security",
      "x-frame-options",
      "x-content-type-options",
      "referrer-policy",
      "permissions-policy"
    ];
    const report = summarizeReport(
      baseReport({
        headers: [
          { url: "https://example.com", status: 200, present: {}, missing, warnings: [] },
          { url: "http://example.com", status: 200, present: {}, missing, warnings: [] }
        ]
      })
    );

    expect(report.riskScore).toBe(25);
    expect(report.summary).toContain("Review recommended");
    expect(report.recommendations).toContain("Add a Content-Security-Policy header to reduce script injection risk.");
    expect(report.recommendations).toContain("Add Strict-Transport-Security so browsers require HTTPS.");
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

  it("ignores missing headers from failed header probes", () => {
    const report = summarizeReport(
      baseReport({
        headers: [
          {
            url: "https://example.com",
            present: {},
            missing: ["content-security-policy", "strict-transport-security"],
            warnings: [],
            error: "Header request timed out"
          }
        ]
      })
    );

    expect(report.riskScore).toBe(0);
    expect(report.recommendations).not.toContain("Add a Content-Security-Policy header to reduce script injection risk.");
    expect(report.recommendations).not.toContain("Add Strict-Transport-Security so browsers require HTTPS.");
  });
});
