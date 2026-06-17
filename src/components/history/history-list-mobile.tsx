import React from "react";
import Link from "next/link";

import { StatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import type { ScanSummary } from "@/components/dashboard/recent-scans";
import {
  displayTarget,
  formatScanDate,
  getRiskTone,
  normalizeScanStatus
} from "@/lib/ui/scan-presenters";

export function HistoryListMobile({ scans }: { scans: ScanSummary[] }) {
  return (
    <div className="grid gap-3 md:hidden">
      {scans.map((scan) => {
        const clickable = normalizeScanStatus(scan.status) === "completed";
        const content = (
          <>
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 font-mono text-sm font-semibold text-ink overflow-wrap-anywhere">
                {displayTarget(scan)}
              </span>
              <StatusBadge status={scan.status} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted">{formatScanDate(scan.createdAt)}</span>
              {clickable ? (
                <Badge tone={getRiskTone(scan.riskScore)}>{scan.riskScore}/100</Badge>
              ) : (
                <span className="text-xs text-slate-400">No score</span>
              )}
            </div>
          </>
        );

        if (!clickable) {
          return (
            <div className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-panel" key={scan.id}>
              {content}
            </div>
          );
        }

        return (
          <Link
            aria-label={`Open ${displayTarget(scan)} report`}
            className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-panel"
            href={`/scans/${scan.id}`}
            key={scan.id}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
