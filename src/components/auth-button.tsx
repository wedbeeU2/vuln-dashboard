"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-sm text-muted">Checking session...</span>;
  }

  if (!session?.user) {
    return (
      <button
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
        onClick={() => signIn("google")}
        type="button"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted">{session.user.email}</span>
      <button
        className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink"
        onClick={() => signOut()}
        type="button"
      >
        Sign out
      </button>
    </div>
  );
}
