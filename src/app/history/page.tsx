import React from "react";
import { redirect } from "next/navigation";

import { AppNav } from "@/components/app/app-nav";
import { EmptyState } from "@/components/app/empty-state";
import { PageHead, PageShell } from "@/components/app/page-shell";
import { HistoryFilters } from "@/components/history/history-filters";
import { HistoryListMobile } from "@/components/history/history-list-mobile";
import { HistoryTable } from "@/components/history/history-table";
import { Card } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  countStatuses,
  filterScans,
  normalizeScanStatus,
  type StatusFilter
} from "@/lib/ui/scan-presenters";

export default async function HistoryPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const params = await searchParams;
  const q = params.q ?? "";
  const status: StatusFilter = params.status === "all" || !params.status ? "all" : normalizeScanStatus(params.status);
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    where: { userId: session.user.id }
  });
  const counts = countStatuses(scans);
  const filtered = filterScans(scans, { q, status });

  return (
    <>
      <AppNav email={session.user.email} />
      <PageShell>
        <PageHead subtitle="Review prior reports scoped to your account." title="Scan history" />
        <HistoryFilters counts={counts} q={q} status={status} />
        {scans.length === 0 ? (
          <Card>
            <EmptyState icon="clock" title="No scans yet">
              Your completed, running, and failed scans will appear here once you run your first scan.
            </EmptyState>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState icon="search" title="No matching scans">
              Nothing matches this search or status filter. Try a different target or filter.
            </EmptyState>
          </Card>
        ) : (
          <>
            <HistoryTable scans={filtered} />
            <HistoryListMobile scans={filtered} />
          </>
        )}
      </PageShell>
    </>
  );
}
