"use client";

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AuthButton({ mode = "full" }: { mode?: "full" | "compact" }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-sm text-muted">Checking session...</span>;
  }

  if (!session?.user) {
    return (
      <Button onClick={() => signIn("google")} type="button" variant="primary">
        Sign in with Google
      </Button>
    );
  }

  if (mode === "compact") {
    return (
      <Button onClick={() => signOut()} size="sm" type="button" variant="secondary">
        Sign out
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted">{session.user.email}</span>
      <Button onClick={() => signOut()} type="button" variant="secondary">
        Sign out
      </Button>
    </div>
  );
}
