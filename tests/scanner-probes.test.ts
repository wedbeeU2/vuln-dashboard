import { describe, expect, it, vi } from "vitest";

const { resolvePublicHostMock } = vi.hoisted(() => ({
  resolvePublicHostMock: vi.fn()
}));

vi.mock("@/lib/scanner/resolve-public-host", () => ({
  resolvePublicHost: resolvePublicHostMock
}));

import { buildHeaderResult } from "@/lib/scanner/headers";
import { checkPort } from "@/lib/scanner/ports";

describe("scanner probes", () => {
  it("rejects disallowed ports before resolving or connecting", async () => {
    resolvePublicHostMock.mockRejectedValue(new Error("resolver should not be called"));

    await expect(checkPort("example.com", 4444)).resolves.toEqual({
      port: 4444,
      service: "unknown",
      status: "error",
      detail: "Port is not in the approved common-port list"
    });
    expect(resolvePublicHostMock).not.toHaveBeenCalled();
  });

  it("builds header results from response headers without body data", () => {
    expect(
      buildHeaderResult("https://example.com", "https", 200, {
        "content-security-policy": "default-src 'self'",
        "strict-transport-security": "max-age=31536000",
        "x-content-type-options": "nosniff"
      })
    ).toEqual({
      url: "https://example.com",
      status: 200,
      present: {
        "Content-Security-Policy": "default-src 'self'",
        "Strict-Transport-Security": "max-age=31536000",
        "X-Content-Type-Options": "nosniff"
      },
      missing: ["X-Frame-Options", "Referrer-Policy", "Permissions-Policy"],
      warnings: []
    });
  });
});
