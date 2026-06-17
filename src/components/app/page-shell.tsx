import React, { type ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto grid max-w-[1100px] gap-5 px-4 py-5 sm:px-7 sm:py-7">{children}</main>;
}

export function PageHead({
  action,
  subtitle,
  title
}: {
  action?: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
