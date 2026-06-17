import React from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

import { StatusBadge } from "@/components/app/status-badge";
import { Card } from "@/components/ui/card";

const steps = [
  { icon: CheckCircle2, label: "DNS records", state: "done" },
  { icon: Loader2, label: "TLS certificate", state: "active" },
  { icon: Circle, label: "HTTP headers", state: "wait" },
  { icon: Circle, label: "Common ports", state: "wait" }
];

export function RunningReport({ target }: { target: string }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-xl font-semibold text-ink overflow-wrap-anywhere sm:text-2xl">
          {target}
        </h1>
        <StatusBadge status="running" />
      </div>
      <div className="mt-6 grid gap-3" role="status" aria-live="polite">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div className="flex min-h-8 items-center gap-3" key={step.label}>
              <Icon
                aria-hidden="true"
                className={
                  step.state === "done"
                    ? "h-5 w-5 text-good-600"
                    : step.state === "active"
                      ? "h-5 w-5 animate-spin text-brand-600"
                      : "h-5 w-5 text-slate-400"
                }
              />
              <span className={step.state === "wait" ? "text-sm text-muted" : "text-sm font-semibold text-ink"}>
                {step.label}
              </span>
              {step.state === "active" ? (
                <span className="ml-auto text-xs font-semibold text-brand-700">Checking...</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
