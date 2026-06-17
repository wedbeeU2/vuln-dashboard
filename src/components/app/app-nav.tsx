"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, LayoutDashboard, ShieldCheck } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/ui/styles";

function initialsFromEmail(email?: string | null) {
  if (!email) {
    return "U";
  }

  return email.slice(0, 2).toUpperCase();
}

export function AppNav({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/" || pathname.startsWith("/scans");
  const isHistory = pathname.startsWith("/history");
  const navItems = [
    { active: isDashboard, href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { active: isHistory, href: "/history", icon: Clock, label: "History" }
  ];

  return (
    <>
      <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-7">
        <div className="flex items-center gap-6">
          <Link className="flex items-center gap-2.5" href="/" aria-label="Security Scanner home">
            <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-ink text-white">
              <ShieldCheck aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <span className="whitespace-nowrap text-base font-semibold text-ink">Security Scanner</span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm sm:flex">
            {navItems.map((item) => (
              <Link
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center border-b-2 px-0.5 font-medium transition-with-motion",
                  item.active
                    ? "border-brand-600 text-ink"
                    : "border-transparent text-muted hover:text-ink"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="hidden sm:inline-flex" tone="neutral">
            Rate limit 9 left
          </Badge>
          {email ? <span className="hidden max-w-[220px] truncate text-sm text-muted lg:inline">{email}</span> : null}
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700"
          >
            {initialsFromEmail(email)}
          </span>
          <AuthButton mode="compact" />
        </div>
      </header>
      <nav
        aria-label="Primary mobile"
        className="sticky top-[60px] z-10 grid grid-cols-2 border-b border-line bg-white sm:hidden"
        role="tablist"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              aria-current={item.active ? "page" : undefined}
              aria-selected={item.active}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 border-b-2 text-sm font-semibold",
                item.active
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-muted"
              )}
              href={item.href}
              key={item.href}
              role="tab"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
