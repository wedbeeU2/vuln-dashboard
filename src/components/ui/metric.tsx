import React from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/ui/styles";
import type { Tone } from "@/lib/ui/scan-presenters";

const valueClasses: Record<Tone, string> = {
  secure: "text-good-700",
  warn: "text-warn-700",
  critical: "text-bad-700",
  info: "text-brand-700",
  neutral: "text-ink"
};

export function Metric({
  label,
  meta,
  tone = "neutral",
  value
}: {
  label: string;
  meta?: ReactNode;
  tone?: Tone;
  value: ReactNode;
}) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">{label}</p>
      <p className={cn("mt-2 font-mono text-2xl font-semibold", valueClasses[tone])}>{value}</p>
      {meta ? <p className="mt-1 text-xs leading-5 text-muted">{meta}</p> : null}
    </div>
  );
}
