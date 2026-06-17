import React from "react";
import { getRiskLabel, getRiskTone, clampRiskScore } from "@/lib/ui/scan-presenters";
import { cn } from "@/lib/ui/styles";

const barClasses = {
  secure: "bg-good-600",
  warn: "bg-warn-600",
  critical: "bg-bad-600",
  info: "bg-brand-600",
  neutral: "bg-slate-500"
};

const textClasses = {
  secure: "text-good-700",
  warn: "text-warn-700",
  critical: "text-bad-700",
  info: "text-brand-700",
  neutral: "text-slate-600"
};

export function RiskMeter({ score }: { score: number }) {
  const safeScore = clampRiskScore(score);
  const tone = getRiskTone(safeScore);
  const label = getRiskLabel(safeScore);

  return (
    <div aria-label={`Risk score ${safeScore} of 100, ${label}`} className="grid gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">Risk score</p>
          <p className={cn("mt-1 font-mono text-3xl font-semibold leading-none", textClasses[tone])}>
            {safeScore}
            <span className="text-sm text-slate-400">/100</span>
          </p>
        </div>
        <p className={cn("text-sm font-semibold", textClasses[tone])}>{label}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-with-motion", barClasses[tone])}
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}
