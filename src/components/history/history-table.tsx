import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { StatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import type { ScanSummary } from "@/components/dashboard/recent-scans";
import {
  displayTarget,
  formatScanDate,
  getRiskTone,
  normalizeScanStatus
} from "@/lib/ui/scan-presenters";

export function HistoryTable({ scans }: { scans: ScanSummary[] }) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-line bg-white shadow-panel md:block">
      <div className="grid grid-cols-[1fr_120px_130px_160px_40px] gap-3 border-b border-line bg-slate-50 px-5 py-3">
        {["Target", "Risk", "Status", "Scanned", ""].map((heading) => (
          <span
            className="text-xs font-semibold uppercase tracking-[0.04em] text-muted"
            key={heading}
            role="columnheader"
          >
            {heading}
          </span>
        ))}
      </div>
      {scans.map((scan) => {
        const clickable = normalizeScanStatus(scan.status) === "completed";
        const row = (
          <>
            <span className="truncate font-mono text-sm font-semibold text-ink">{displayTarget(scan)}</span>
            <span>
              {clickable ? (
                <Badge tone={getRiskTone(scan.riskScore)}>{scan.riskScore}/100</Badge>
              ) : (
                <span className="text-sm text-slate-400">No score</span>
              )}
            </span>
            <span>
              <StatusBadge status={scan.status} />
            </span>
            <span className="text-sm text-muted">{formatScanDate(scan.createdAt)}</span>
            <span className="flex justify-end">
              {clickable ? <ChevronRight aria-hidden="true" className="h-4 w-4 text-slate-400" /> : null}
            </span>
          </>
        );

        if (!clickable) {
          return (
            <div
              className="grid min-h-12 grid-cols-[1fr_120px_130px_160px_40px] items-center gap-3 border-b border-line px-5 py-3 last:border-b-0"
              key={scan.id}
            >
              {row}
            </div>
          );
        }

        return (
          <Link
            aria-label={`Open ${displayTarget(scan)} report`}
            className="grid min-h-12 grid-cols-[1fr_120px_130px_160px_40px] items-center gap-3 border-b border-line px-5 py-3 transition-with-motion hover:bg-slate-50 last:border-b-0"
            href={`/scans/${scan.id}`}
            key={scan.id}
          >
            {row}
          </Link>
        );
      })}
    </div>
  );
}
