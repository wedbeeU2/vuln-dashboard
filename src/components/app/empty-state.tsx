import React, { type ReactNode } from "react";
import { Clock, Inbox, Radar, SearchX } from "lucide-react";

const icons = {
  clock: Clock,
  inbox: Inbox,
  radar: Radar,
  search: SearchX
};

export function EmptyState({
  action,
  children,
  icon = "inbox",
  title
}: {
  action?: ReactNode;
  children: ReactNode;
  icon?: keyof typeof icons;
  title: string;
}) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-slate-50 text-slate-400">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm leading-6 text-muted">{children}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
