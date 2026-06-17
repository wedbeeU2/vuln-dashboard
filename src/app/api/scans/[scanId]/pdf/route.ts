import React from "react";
import { pdf } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportPdf } from "@/lib/report/pdf";
import type { SecurityReport } from "@/types/report";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ scanId: string }> }) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scanId } = await params;
  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      userId: session.user.id,
      status: "completed"
    }
  });

  if (!scan || !isSecurityReport(scan.report)) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const document = React.createElement(ReportPdf, { report: scan.report });
  const blob = await pdf(document as unknown as Parameters<typeof pdf>[0]).toBlob();
  const body = await blob.arrayBuffer();
  const filename = `security-report-${safeFilename(scan.normalizedTarget || scan.report.normalizedTarget)}.pdf`;

  return new Response(body, {
    headers: {
      "content-disposition": `attachment; filename="${filename}"`,
      "content-type": "application/pdf"
    },
    status: 200
  });
}

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9.-]+/g, "-").replace(/^-+|-+$/g, "") || "scan";
}

function isSecurityReport(value: unknown): value is SecurityReport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const report = value as Partial<SecurityReport>;

  return (
    typeof report.target === "string" &&
    typeof report.normalizedTarget === "string" &&
    typeof report.scannedAt === "string" &&
    typeof report.riskScore === "number" &&
    typeof report.summary === "string" &&
    Array.isArray(report.ports) &&
    typeof report.tls === "object" &&
    Array.isArray(report.headers) &&
    typeof report.dns === "object" &&
    Array.isArray(report.recommendations)
  );
}
