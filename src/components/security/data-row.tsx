import React from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/ui/styles";

export function DataRow({
  divider = true,
  label,
  mono = true,
  stack = false,
  status,
  value
}: {
  divider?: boolean;
  label: string;
  mono?: boolean;
  stack?: boolean;
  status?: ReactNode;
  value?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 py-3",
        stack ? "flex-col" : "items-start justify-between",
        divider && "border-b border-line"
      )}
    >
      <p className={cn("text-sm font-semibold text-ink", mono && "font-mono")}>{label}</p>
      {value || status ? (
        <div className={cn("min-w-0 text-sm leading-6 text-muted", !stack && "text-right")}>
          {value ? (
            <p className={cn("overflow-wrap-anywhere", mono && "font-mono text-[13px]")}>{value}</p>
          ) : null}
          {status ? <div className={cn(value && "mt-1", !stack && "flex justify-end")}>{status}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
