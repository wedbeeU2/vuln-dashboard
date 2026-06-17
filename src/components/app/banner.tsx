import React, { type ReactNode } from "react";
import { AlertTriangle, CloudOff, Info, ShieldOff } from "lucide-react";

import { cn } from "@/lib/ui/styles";
import type { Tone } from "@/lib/ui/scan-presenters";

const toneClasses: Record<Tone, string> = {
  secure: "border-good-100 bg-good-50 text-good-700",
  warn: "border-warn-100 bg-warn-50 text-warn-700",
  critical: "border-bad-100 bg-bad-50 text-bad-700",
  info: "border-brand-100 bg-brand-50 text-brand-700",
  neutral: "border-line bg-slate-50 text-slate-700"
};

const icons = {
  alert: AlertTriangle,
  cloud: CloudOff,
  info: Info,
  shield: ShieldOff
};

export function Banner({
  action,
  children,
  icon = "info",
  title,
  tone = "info"
}: {
  action?: ReactNode;
  children: ReactNode;
  icon?: keyof typeof icons;
  title?: string;
  tone?: Tone;
}) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        toneClasses[tone]
      )}
      role={tone === "critical" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold text-ink">{title}</p> : null}
        <div className="mt-1 text-sm leading-6 text-slate-700 overflow-wrap-anywhere">{children}</div>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
