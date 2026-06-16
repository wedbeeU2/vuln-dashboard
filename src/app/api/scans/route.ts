import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { runSecurityScan } from "@/lib/scanner/run-scan";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Scan failed";
}

async function targetFromRequest(request: Request) {
  const body = await request.json().catch(() => null);

  return typeof body?.target === "string" ? body.target : "";
}

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scans = await prisma.scan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json({ scans });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(session.user.id);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
      { status: 429 }
    );
  }

  const target = await targetFromRequest(request);
  const scan = await prisma.scan.create({
    data: {
      userId: session.user.id,
      target,
      normalizedTarget: "",
      status: "running"
    }
  });

  try {
    const report = await runSecurityScan(target);
    const updated = await prisma.scan.update({
      where: { id: scan.id },
      data: {
        normalizedTarget: report.normalizedTarget,
        status: "completed",
        riskScore: report.riskScore,
        summary: report.summary,
        report,
        completedAt: new Date()
      }
    });

    return NextResponse.json({ scan: updated });
  } catch (error) {
    const message = errorMessage(error);
    const failed = await prisma.scan.update({
      where: { id: scan.id },
      data: { status: "failed", error: message }
    });

    return NextResponse.json({ error: message, scan: failed }, { status: 400 });
  }
}
