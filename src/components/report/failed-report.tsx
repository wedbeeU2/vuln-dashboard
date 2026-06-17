import React from "react";
import { RefreshCw } from "lucide-react";

import { Banner } from "@/components/app/banner";
import { StatusBadge } from "@/components/app/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FailedReport({
  error,
  target
}: {
  error?: string | null;
  target: string;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-xl font-semibold text-ink overflow-wrap-anywhere sm:text-2xl">
          {target}
        </h1>
        <StatusBadge status="failed" />
      </div>
      <div className="mt-5">
        <Banner
          action={
            <ButtonLink
              href="/"
              iconLeft={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
              size="sm"
            >
              Run scan again
            </ButtonLink>
          }
          icon="alert"
          tone="critical"
          title="Scan failed"
        >
          {error || "The scanner could not complete this request."}
        </Banner>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">
        Common causes: the host has no public DNS records, the domain is misspelled, or the
        target was unreachable within the scan timeout.
      </p>
    </Card>
  );
}
