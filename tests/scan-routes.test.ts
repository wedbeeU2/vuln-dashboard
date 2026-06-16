import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { runSecurityScan } from "@/lib/scanner/run-scan";

vi.mock("@/lib/auth", () => ({
  getCurrentSession: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    scan: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    }
  }
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn()
}));

vi.mock("@/lib/scanner/run-scan", () => ({
  runSecurityScan: vi.fn()
}));

const getCurrentSessionMock = vi.mocked(getCurrentSession);
const checkRateLimitMock = vi.mocked(checkRateLimit);
const runSecurityScanMock = vi.mocked(runSecurityScan);
const scanModel = vi.mocked(prisma.scan);

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/scans", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("scan API routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getCurrentSessionMock.mockResolvedValue({
      user: {
        id: "user_123",
        email: "user@example.com",
        image: null,
        name: "Example User"
      },
      expires: "2030-01-01T00:00:00.000Z"
    });
    checkRateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 9,
      resetAt: 1_800_000_000_000
    });
  });

  it("returns 401 when listing scans without a session", async () => {
    getCurrentSessionMock.mockResolvedValue(null);
    const { GET } = await import("@/app/api/scans/route");

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("lists only scans owned by the current user", async () => {
    scanModel.findMany.mockResolvedValue([]);
    const { GET } = await import("@/app/api/scans/route");

    const response = await GET();

    expect(response.status).toBe(200);
    expect(scanModel.findMany).toHaveBeenCalledWith({
      where: { userId: "user_123" },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  });

  it("fetches a single scan by id and owner", async () => {
    scanModel.findFirst.mockResolvedValue({ id: "scan_123", userId: "user_123" });
    const { GET } = await import("@/app/api/scans/[scanId]/route");

    const response = await GET(new Request("http://localhost/api/scans/scan_123"), {
      params: Promise.resolve({ scanId: "scan_123" })
    });

    expect(response.status).toBe(200);
    expect(scanModel.findFirst).toHaveBeenCalledWith({
      where: {
        id: "scan_123",
        userId: "user_123"
      }
    });
  });

  it("returns 429 before scan execution when rate limited", async () => {
    checkRateLimitMock.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: 1_800_000_000_000
    });
    const { POST } = await import("@/app/api/scans/route");

    const response = await POST(jsonRequest({ target: "example.com" }));

    expect(response.status).toBe(429);
    expect(runSecurityScanMock).not.toHaveBeenCalled();
    expect(scanModel.create).not.toHaveBeenCalled();
  });

  it("creates a running scan and updates it when scan execution succeeds", async () => {
    scanModel.create.mockResolvedValue({ id: "scan_123", status: "running" });
    scanModel.update.mockResolvedValue({ id: "scan_123", status: "completed" });
    runSecurityScanMock.mockResolvedValue({
      target: "example.com",
      normalizedTarget: "example.com",
      scannedAt: "2026-06-16T00:00:00.000Z",
      riskScore: 20,
      summary: "No urgent issues found in the v1 checks.",
      ports: [],
      tls: { checked: true, valid: true },
      headers: [],
      dns: { records: {}, errors: {} },
      recommendations: []
    });
    const { POST } = await import("@/app/api/scans/route");

    const response = await POST(jsonRequest({ target: "example.com" }));

    expect(response.status).toBe(200);
    expect(scanModel.create).toHaveBeenCalledWith({
      data: {
        userId: "user_123",
        target: "example.com",
        normalizedTarget: "",
        status: "running"
      }
    });
    expect(runSecurityScanMock).toHaveBeenCalledWith("example.com");
    expect(scanModel.update).toHaveBeenCalledWith({
      where: { id: "scan_123" },
      data: expect.objectContaining({
        normalizedTarget: "example.com",
        status: "completed",
        riskScore: 20,
        summary: "No urgent issues found in the v1 checks.",
        completedAt: expect.any(Date)
      })
    });
    expect(await response.json()).toEqual({ scan: { id: "scan_123", status: "completed" } });
  });

  it("marks the scan failed and returns 400 when scan execution fails", async () => {
    scanModel.create.mockResolvedValue({ id: "scan_123", status: "running" });
    scanModel.update.mockResolvedValue({ id: "scan_123", status: "failed", error: "Scan failed" });
    runSecurityScanMock.mockRejectedValue(new Error("Scan failed"));
    const { POST } = await import("@/app/api/scans/route");

    const response = await POST(jsonRequest({ target: "bad target" }));

    expect(response.status).toBe(400);
    expect(scanModel.update).toHaveBeenCalledWith({
      where: { id: "scan_123" },
      data: { status: "failed", error: "Scan failed" }
    });
    expect(await response.json()).toEqual({
      error: "Scan failed",
      scan: { id: "scan_123", status: "failed", error: "Scan failed" }
    });
  });
});
