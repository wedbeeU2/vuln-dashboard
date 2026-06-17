import React from "react";
import Link from "next/link";
import { ChevronRight, Globe } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { StatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  displayTarget,
  formatScanDate,
  getRiskTone,
  normalizeScanStatus
} from "@/lib/ui/scan-presenters";

export type ScanSummary = {
  id: string;
  target: string;
  normalizedTarget: string;
  status: string;
  riskScore: number;
  createdAt: Date | string;
};

export function RecentScans({ scans }: { scans: ScanSummary[] }) {
  return (
    <Card>
      <CardHeader description="Reports scoped to your account" title="Recent scans" />
      {scans.length === 0 ? (
        <EmptyState
          action={
            <ButtonLink href="/" size="sm">
              Run your first scan
            </ButtonLink>
          }
          icon="radar"
          title="No scans yet"
        >
          Run a scan above to generate your first structured security report. Results appear here.
        </EmptyState>
      ) : (
        <div className="divide-y divide-line">
          {scans.slice(0, 6).map((scan) => {
            const status = normalizeScanStatus(scan.status);
            const clickable = status === "completed";
            const content = (
              <>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-slate-50 text-muted">
                    <Globe aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-semibold text-ink">{displayTarget(scan)}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatScanDate(scan.createdAt)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  {status === "completed" ? (
                    <Badge className="hidden sm:inline-flex" tone={getRiskTone(scan.riskScore)}>
                      {scan.riskScore}/100
                    </Badge>
                  ) : null}
                  <StatusBadge status={scan.status} />
                  {clickable ? <ChevronRight aria-hidden="true" className="h-4 w-4 text-slate-400" /> : null}
                </div>
              </>
            );

            if (!clickable) {
              return (
                <div className="flex min-h-11 items-center justify-between gap-3 py-3" key={scan.id}>
                  {content}
                </div>
              );
            }

            return (
              <Link
                aria-label={`${displayTarget(scan)} report, risk ${scan.riskScore} of 100`}
                className="flex min-h-11 items-center justify-between gap-3 py-3 transition-with-motion hover:bg-slate-50"
                href={`/scans/${scan.id}`}
                key={scan.id}
              >
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
