import React from "react";
import { Download } from "lucide-react";

import { StatusBadge } from "@/components/app/status-badge";
import { RiskMeter } from "@/components/security/risk-meter";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import type { SecurityReport } from "@/types/report";

export function ReportOverview({ report, scanId }: { report: SecurityReport; scanId: string }) {
  const openPorts = report.ports.filter((port) => port.status === "open");
  const tlsMeta = report.tls.error
    ? "Unavailable"
    : report.tls.daysUntilExpiration !== undefined
      ? `Expires in ${report.tls.daysUntilExpiration} days`
      : "Certificate checked";

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-xl font-semibold text-ink overflow-wrap-anywhere sm:text-2xl">
              {report.normalizedTarget}
            </h1>
            <StatusBadge status="completed" />
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{report.summary}</p>
        </div>
        <ButtonLink
          className="w-full sm:w-auto"
          href={`/api/scans/${scanId}/pdf`}
          iconLeft={<Download aria-hidden="true" className="h-4 w-4" />}
          variant="inverse"
        >
          Export PDF
        </ButtonLink>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="rounded-md border border-line p-4">
          <RiskMeter score={report.riskScore} />
        </div>
        <Metric label="Open ports" meta={`of ${report.ports.length} common ports`} tone="warn" value={openPorts.length} />
        <Metric
          label="TLS"
          meta={tlsMeta}
          tone={report.tls.error ? "warn" : report.tls.valid ? "secure" : "critical"}
          value={report.tls.error ? "Unavailable" : report.tls.valid ? "Valid" : "Invalid"}
        />
      </div>
    </Card>
  );
}
