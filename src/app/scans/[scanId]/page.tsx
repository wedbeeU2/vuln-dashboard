import React from "react";
import { notFound, redirect } from "next/navigation";

import { AppNav } from "@/components/app/app-nav";
import { PageShell } from "@/components/app/page-shell";
import { ReportView } from "@/components/report/report-view";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ScanReportPage({
  params
}: {
  params: Promise<{ scanId: string }>;
}) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const { scanId } = await params;
  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      userId: session.user.id
    }
  });

  if (!scan) {
    notFound();
  }

  return (
    <>
      <AppNav email={session.user.email} />
      <PageShell>
        <ReportView scan={scan} />
      </PageShell>
    </>
  );
}
