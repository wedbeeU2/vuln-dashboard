"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Code2 } from "lucide-react";

import { Card } from "@/components/ui/card";

export function RawDetails({ value }: { value: unknown }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <button
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex items-center gap-2.5 text-lg font-semibold text-ink">
          <Code2 aria-hidden="true" className="h-4 w-4 text-muted" />
          Raw technical details
        </span>
        {open ? (
          <ChevronUp aria-hidden="true" className="h-5 w-5 text-muted" />
        ) : (
          <ChevronDown aria-hidden="true" className="h-5 w-5 text-muted" />
        )}
      </button>
      {open ? (
        <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 overflow-wrap-anywhere">
          {JSON.stringify(value, null, 2)}
        </pre>
      ) : (
        <p className="mt-2 text-sm leading-6 text-muted">
          Full structured JSON used for the report, PDF export, and API. Click to expand.
        </p>
      )}
    </Card>
  );
}
