"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Globe, Info, Loader2, Radar } from "lucide-react";

import { Banner } from "@/components/app/banner";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { cn } from "@/lib/ui/styles";

const progressSteps = [
  { icon: Check, label: "DNS records", state: "done" },
  { icon: Loader2, label: "TLS certificate", state: "active" },
  { icon: Loader2, label: "HTTP headers", state: "active" },
  { icon: Clock, label: "Common ports", state: "wait" }
];

export function ScanForm() {
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runScan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/scans", {
        body: JSON.stringify({ target }),
        headers: { "content-type": "application/json" },
        method: "POST"
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Scan failed");
        return;
      }

      router.push(`/scans/${payload.scan.id}`, { scroll: false });
      router.refresh();
    } catch {
      setError("The scanner is temporarily unavailable. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-lg border border-line bg-white p-5 shadow-panel sm:p-6" onSubmit={runScan}>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <TextInput
          autoComplete="off"
          disabled={loading}
          error={error}
          icon={<Globe aria-hidden="true" className="h-4 w-4" />}
          inputMode="url"
          label="Domain or public IP"
          onChange={(event) => setTarget(event.target.value)}
          placeholder="example.com"
          spellCheck={false}
          value={target}
        />
        <div className="flex items-end">
          <Button
            className="h-[46px] w-full sm:w-auto"
            disabled={loading}
            iconLeft={
              loading ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Radar aria-hidden="true" className="h-4 w-4" />
              )
            }
            type="submit"
          >
            {loading ? "Scanning..." : "Run scan"}
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted">
        <Info aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
        <p>Only scan assets you own or have permission to test. Private, local, and reserved ranges are blocked.</p>
      </div>
      {loading ? (
        <div className="mt-5 border-t border-line pt-4" role="status" aria-live="polite">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-brand-600" />
            Scanning {target || "target"}...
          </div>
          <div className="flex flex-wrap gap-2">
            {progressSteps.map((step) => {
              const Icon = step.icon;
              return (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-line bg-slate-50 px-3 py-1.5 text-xs font-semibold",
                    step.state === "wait" ? "text-slate-400" : "text-slate-700"
                  )}
                  key={step.label}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "h-3.5 w-3.5",
                      step.state === "done" && "text-good-600",
                      step.state === "active" && "animate-spin text-brand-600",
                      step.state === "wait" && "text-slate-400"
                    )}
                  />
                  {step.label}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Banner icon="alert" tone="critical" title="Scan failed">
            {error}
          </Banner>
        </div>
      ) : null}
    </form>
  );
}
