import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { TextInput } from "@/components/ui/input";
import { cn } from "@/lib/ui/styles";
import type { StatusFilter } from "@/lib/ui/scan-presenters";

const filters: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Running", value: "running" },
  { label: "Failed", value: "failed" }
];

export function HistoryFilters({
  counts,
  q,
  status
}: {
  counts: Record<StatusFilter, number>;
  q: string;
  status: StatusFilter;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <form action="/history" className="min-w-[220px] flex-1 sm:max-w-[360px]">
        <input name="status" type="hidden" value={status} />
        <TextInput
          defaultValue={q}
          icon={<Search aria-hidden="true" className="h-4 w-4" />}
          label="Search scans"
          name="q"
          placeholder="Search by target..."
        />
      </form>
      <div
        aria-label="Filter by status"
        className="flex flex-wrap gap-1 rounded-md border border-line bg-slate-50 p-1"
        role="tablist"
      >
        {filters.map((filter) => {
          const active = filter.value === status;
          const href = `/history?status=${filter.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
          return (
            <Link
              aria-selected={active}
              className={cn(
                "inline-flex min-h-9 items-center gap-2 rounded-sm px-3 text-sm font-semibold",
                active ? "bg-white text-ink shadow-xs" : "text-muted hover:text-ink"
              )}
              href={href}
              key={filter.value}
              role="tab"
            >
              {filter.label}
              <span className={active ? "text-brand-700" : "text-slate-400"}>{counts[filter.value]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
