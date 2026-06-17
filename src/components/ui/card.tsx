import React from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/ui/styles";

export function Card({
  children,
  className,
  padding = "md"
}: {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-line bg-white shadow-panel",
        padding === "sm" && "p-4 sm:p-5",
        padding === "md" && "p-5 sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  action,
  description,
  title
}: {
  action?: ReactNode;
  description?: ReactNode;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink sm:text-lg">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
