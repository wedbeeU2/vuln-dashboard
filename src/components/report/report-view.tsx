import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, Minus, X } from "lucide-react";

import { Banner } from "@/components/app/banner";
import { DataRow } from "@/components/security/data-row";
import { Badge } from "@/components/ui/badge";
import { FailedReport } from "@/components/report/failed-report";
import { RawDetails } from "@/components/report/raw-details";
import { ReportOverview } from "@/components/report/report-overview";
import { ReportSectionCard } from "@/components/report/report-section-card";
import { RunningReport } from "@/components/report/running-report";
import { normalizeScanStatus } from "@/lib/ui/scan-presenters";
import type { SecurityReport } from "@/types/report";

type ScanForReport = {
  id: string;
  target: string;
  normalizedTarget: string;
  status: string;
  error?: string | null;
  report?: unknown;
};

const riskyPorts = new Set([21, 23, 3306, 5432, 6379]);

export function ReportView({ scan }: { scan: ScanForReport }) {
  const status = normalizeScanStatus(scan.status);
  const target = scan.normalizedTarget || scan.target || "Pending target";

  return (
    <div className="grid gap-5">
      <Link className="flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-muted hover:text-ink" href="/">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to dashboard
      </Link>
      {status === "failed" ? <FailedReport error={scan.error} target={target} /> : null}
      {status === "running" || status === "queued" ? <RunningReport target={target} /> : null}
      {status === "completed" && isSecurityReport(scan.report) ? (
        <CompletedReport report={scan.report} scanId={scan.id} />
      ) : null}
      {status === "completed" && !isSecurityReport(scan.report) ? (
        <Banner icon="cloud" tone="warn" title="Report unavailable">
          This scan is marked completed, but the structured report payload is unavailable.
        </Banner>
      ) : null}
    </div>
  );
}

function CompletedReport({ report, scanId }: { report: SecurityReport; scanId: string }) {
  const openPorts = report.ports.filter((port) => port.status === "open");
  const firstHeader = report.headers[0];
  const dnsErrorEntries = Object.entries(report.dns.errors ?? {});

  return (
    <>
      <ReportOverview report={report} scanId={scanId} />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <ReportSectionCard description={`${openPorts.length} reachable services`} title="Open ports">
          {report.ports.length === 0 ? (
            <p className="text-sm text-muted">No common ports were checked.</p>
          ) : (
            report.ports.map((port, index) => {
              const exposed = port.status === "open";
              const risky = exposed && riskyPorts.has(port.port);
              return (
                <DataRow
                  divider={index < report.ports.length - 1}
                  key={port.port}
                  label={`${port.port} / ${port.service}`}
                  status={
                    exposed ? (
                      <Badge tone={risky ? "critical" : "secure"}>
                        {risky ? <AlertTriangle aria-hidden="true" className="h-3 w-3" /> : <Check aria-hidden="true" className="h-3 w-3" />}
                        {risky ? "Exposed" : "Open"}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">
                        <Minus aria-hidden="true" className="h-3 w-3" />
                        {port.status}
                      </Badge>
                    )
                  }
                />
              );
            })
          )}
        </ReportSectionCard>

        <ReportSectionCard description="HTTPS on port 443" title="TLS certificate">
          {report.tls.error ? (
            <Banner icon="shield" tone="warn" title="TLS unavailable">
              {report.tls.error}
            </Banner>
          ) : (
            <>
              <DataRow label="issuer" stack value={report.tls.issuer ?? "Unavailable"} />
              <DataRow label="subject" stack value={report.tls.subject ?? "Unavailable"} />
              <DataRow label="protocol" value={report.tls.protocol ?? "Unavailable"} />
              <DataRow label="cipher" stack value={report.tls.cipher ?? "Unavailable"} />
              <DataRow
                divider={false}
                label="valid-to"
                stack
                status={
                  <Badge tone={report.tls.valid ? "secure" : "critical"}>
                    {report.tls.valid ? <Check aria-hidden="true" className="h-3 w-3" /> : <X aria-hidden="true" className="h-3 w-3" />}
                    {report.tls.valid ? "Valid" : "Invalid"}
                  </Badge>
                }
                value={report.tls.validTo ?? "Unavailable"}
              />
            </>
          )}
        </ReportSectionCard>

        <ReportSectionCard description={firstHeader?.url ?? "HTTP response"} title="HTTP security headers">
          {!firstHeader ? (
            <Banner icon="cloud" tone="warn" title="Headers unavailable">
              No HTTP header probe result was returned.
            </Banner>
          ) : firstHeader.error ? (
            <Banner icon="cloud" tone="warn" title="Headers unavailable">
              {firstHeader.error}
            </Banner>
          ) : (
            <>
              {Object.entries(firstHeader.present).map(([header, value]) => (
                <DataRow
                  key={header}
                  label={header}
                  mono={false}
                  stack
                  status={
                    <Badge tone="secure">
                      <Check aria-hidden="true" className="h-3 w-3" />
                      Present
                    </Badge>
                  }
                  value={value}
                />
              ))}
              {firstHeader.missing.map((header, index) => (
                <DataRow
                  divider={index < firstHeader.missing.length - 1}
                  key={header}
                  label={header}
                  mono={false}
                  status={
                    <Badge tone="critical">
                      <X aria-hidden="true" className="h-3 w-3" />
                      Missing
                    </Badge>
                  }
                />
              ))}
              {firstHeader.warnings.map((warning) => (
                <Banner icon="alert" key={warning} tone="warn">
                  {warning}
                </Banner>
              ))}
            </>
          )}
        </ReportSectionCard>

        <ReportSectionCard title="DNS records">
          {Object.entries(report.dns.records).map(([type, values]) => (
            <DataRow key={type} label={type} stack value={values.join(" | ")} />
          ))}
          {dnsErrorEntries.map(([type, error], index) => (
            <DataRow
              divider={index < dnsErrorEntries.length - 1}
              key={type}
              label={type}
              stack
              status={
                <Badge tone="warn">
                  <Minus aria-hidden="true" className="h-3 w-3" />
                  Unavailable
                </Badge>
              }
              value={error}
            />
          ))}
        </ReportSectionCard>
      </div>

      <ReportSectionCard
        description={`${report.recommendations.length} items to review`}
        title="Recommendations"
      >
        {report.recommendations.length === 0 ? (
          <p className="text-sm text-muted">No urgent recommendations.</p>
        ) : (
          <div className="grid gap-3">
            {report.recommendations.map((recommendation) => (
              <div className="flex items-start gap-3" key={recommendation}>
                <AlertTriangle aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-warn-600" />
                <p className="text-sm leading-6 text-slate-700">{recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </ReportSectionCard>
      <RawDetails value={report} />
    </>
  );
}

function isSecurityReport(value: unknown): value is SecurityReport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const report = value as Partial<SecurityReport>;

  return (
    typeof report.normalizedTarget === "string" &&
    typeof report.riskScore === "number" &&
    Array.isArray(report.ports) &&
    typeof report.tls === "object" &&
    Array.isArray(report.headers) &&
    typeof report.dns === "object" &&
    Array.isArray(report.recommendations)
  );
}
