import { describe, expect, it, vi } from "vitest";

import {
  dashboardUrl,
  getInspectableTarget,
  scanCurrentTarget
} from "../extension/popup-core.js";

describe("extension popup helpers", () => {
  it("extracts an inspectable hostname from an http tab", () => {
    expect(getInspectableTarget({ url: "https://Example.com/path?q=1" })).toEqual({
      ok: true,
      target: "example.com"
    });
  });

  it("rejects browser and extension pages before scanning", () => {
    expect(getInspectableTarget({ url: "chrome://extensions" })).toEqual({
      ok: false,
      message: "Open a public website tab before scanning."
    });
  });

  it("submits scans to the backend with session cookies included", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { scan: { id: "scan_123" } }));

    const result = await scanCurrentTarget({
      apiBase: "http://localhost:3000",
      fetchImpl,
      target: "example.com"
    });

    expect(result).toEqual({
      ok: true,
      reportUrl: "http://localhost:3000/scans/scan_123",
      scanId: "scan_123"
    });
    expect(fetchImpl).toHaveBeenCalledWith("http://localhost:3000/api/extension/scan", {
      body: JSON.stringify({ target: "example.com" }),
      credentials: "include",
      headers: { "content-type": "application/json" },
      method: "POST"
    });
  });

  it("turns unauthorized responses into sign-in guidance", async () => {
    const result = await scanCurrentTarget({
      apiBase: "http://localhost:3000",
      fetchImpl: async () => jsonResponse(401, { error: "Unauthorized" }),
      target: "example.com"
    });

    expect(result).toEqual({
      ok: false,
      message: "Sign in to the dashboard, then try again from this popup.",
      reportUrl: "http://localhost:3000"
    });
  });

  it("builds dashboard URLs without duplicate slashes", () => {
    expect(dashboardUrl("http://localhost:3000/", "scan_123")).toBe("http://localhost:3000/scans/scan_123");
  });
});

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  } as Response;
}
