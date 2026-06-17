import React from "react";
import { ShieldCheck } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { Card } from "@/components/ui/card";

export function SignedOutGate() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-[440px] text-center" padding="md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white">
          <ShieldCheck aria-hidden="true" className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-ink">Security Scanner Dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Sign in with Google to scan public domains and IP addresses, save structured reports,
          and revisit prior findings.
        </p>
        <div className="mt-6 flex justify-center">
          <AuthButton />
        </div>
        <p className="mt-5 rounded-md border border-line bg-slate-50 px-4 py-3 text-left text-xs leading-5 text-muted">
          Only scan assets you own or have permission to assess. Private, local, and reserved
          ranges are blocked.
        </p>
      </Card>
    </main>
  );
}
