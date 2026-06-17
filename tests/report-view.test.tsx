import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReportView } from "@/components/report/report-view";
import type { SecurityReport } from "@/types/report";

function report(overrides: Partial<SecurityReport> = {}): SecurityReport {
  return {
    target: "example.com",
    normalizedTarget: "example.com",
    scannedAt: "2026-06-17T16:23:06.835Z",
    riskScore: 0,
    summary: "No urgent issues found in the v1 checks.",
    ports: [],
    tls: { checked: true, valid: true, daysUntilExpiration: 120 },
    headers: [],
    dns: { records: {}, errors: {} },
    recommendations: [],
    ...overrides
  };
}

function renderReport(reportPayload: SecurityReport) {
  return renderToStaticMarkup(
    <ReportView
      scan={{
        id: "scan_1",
        target: reportPayload.target,
        normalizedTarget: reportPayload.normalizedTarget,
        status: "completed",
        report: reportPayload
      }}
    />
  );
}

describe("ReportView", () => {
  it("uses an available HTTP header result when HTTPS header probing fails", () => {
    const html = renderReport(
      report({
        headers: [
          {
            url: "https://example.com",
            present: {},
            missing: ["Content-Security-Policy"],
            warnings: [],
            error: "Header request timed out"
          },
          {
            url: "http://example.com",
            status: 200,
            present: { "X-Content-Type-Options": "nosniff" },
            missing: ["Content-Security-Policy"],
            warnings: ["Response is missing Content-Security-Policy"]
          }
        ]
      })
    );

    expect(html).toContain("http://example.com");
    expect(html).toContain("X-Content-Type-Options");
    expect(html).not.toContain("Headers unavailable");
  });

  it("labels port timeouts as filtered or no response", () => {
    const html = renderReport(
      report({
        ports: [{ port: 25, service: "SMTP", status: "timeout", detail: "timeout" }]
      })
    );

    expect(html).toContain("Filtered / no response");
    expect(html).not.toContain(">timeout<");
  });

  it("labels DNS ENODATA as no record found instead of unavailable", () => {
    const html = renderReport(
      report({
        dns: {
          records: { A: ["93.184.216.34"], CNAME: [] },
          errors: { CNAME: "queryCname ENODATA example.com" }
        }
      })
    );

    expect(html).toContain("No record found");
    expect(html).not.toContain("queryCname ENODATA");
  });

  it("renders stored DNS rows when older reports do not include nested DNS errors", () => {
    const html = renderReport(
      report({
        dns: {
          records: { A: ["93.184.216.34"] }
        } as SecurityReport["dns"]
      })
    );

    expect(html).toContain("93.184.216.34");
  });
});
