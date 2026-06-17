import React, { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/ui/styles";
import type { Tone } from "@/lib/ui/scan-presenters";

const toneClasses: Record<Tone, string> = {
  secure: "border-good-100 bg-good-50 text-good-700",
  warn: "border-warn-100 bg-warn-50 text-warn-700",
  critical: "border-bad-100 bg-bad-50 text-bad-700",
  info: "border-brand-100 bg-brand-50 text-brand-700",
  neutral: "border-line bg-slate-100 text-slate-600"
};

export function Badge({
  children,
  className,
  tone = "neutral",
  ...props
}: {
  children: ReactNode;
  className?: string;
  tone?: Tone;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
