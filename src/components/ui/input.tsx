import React from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/ui/styles";

export function TextInput({
  className,
  error,
  hint,
  icon,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  hint?: string;
  icon?: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span>{label}</span>
      <span
        className={cn(
          "flex min-h-[46px] items-center gap-2.5 rounded-md border border-line bg-white px-3 text-sm transition-with-motion focus-within:border-brand-600 focus-within:ring-3 focus-within:ring-ring",
          error && "border-bad-600 focus-within:border-bad-600",
          className
        )}
      >
        {icon ? <span className="shrink-0 text-slate-400">{icon}</span> : null}
        <input
          className="min-w-0 flex-1 bg-transparent font-mono text-[14.5px] text-ink outline-none placeholder:text-slate-400"
          {...props}
        />
      </span>
      {error ? <span className="text-sm font-semibold text-bad-700">{error}</span> : null}
      {!error && hint ? <span className="text-xs font-normal leading-5 text-muted">{hint}</span> : null}
    </label>
  );
}
