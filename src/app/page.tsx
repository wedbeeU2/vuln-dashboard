import React from "react";

import { AppNav } from "@/components/app/app-nav";
import { PageHead, PageShell } from "@/components/app/page-shell";
import { ScanForm } from "@/components/dashboard/scan-form";
import { RecentScans } from "@/components/dashboard/recent-scans";
import { SignedOutGate } from "@/components/dashboard/signed-out-gate";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return <SignedOutGate />;
  }

  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    where: { userId: session.user.id }
  });

  return (
    <>
      <AppNav email={session.user.email} />
      <PageShell>
        <PageHead
          subtitle="Run real checks against public targets you have permission to assess."
          title="Scanner dashboard"
        />
        <ScanForm />
        <RecentScans scans={scans} />
      </PageShell>
    </>
  );
}
