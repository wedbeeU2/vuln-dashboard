import { describe, expect, it, vi } from "vitest";
import { resolvePublicHost } from "@/lib/scanner/resolve-public-host";

describe("resolvePublicHost", () => {
  it("returns resolved public addresses for a domain", async () => {
    const lookup = vi.fn(async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "2606:2800:220:1:248:1893:25c8:1946", family: 6 }
    ]);

    await expect(resolvePublicHost("example.com", lookup)).resolves.toEqual({
      host: "example.com",
      addresses: [
        { address: "93.184.216.34", family: 4 },
        { address: "2606:2800:220:1:248:1893:25c8:1946", family: 6 }
      ]
    });
    expect(lookup).toHaveBeenCalledWith("example.com");
  });

  it("does not resolve IP literals again when they are already public", async () => {
    const lookup = vi.fn();

    await expect(resolvePublicHost("8.8.8.8", lookup)).resolves.toEqual({
      host: "8.8.8.8",
      addresses: [{ address: "8.8.8.8", family: 4 }]
    });
    expect(lookup).not.toHaveBeenCalled();
  });

  it("rejects a domain when any resolved address is not public unicast", async () => {
    const lookup = vi.fn(async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "192.168.1.10", family: 4 }
    ]);

    await expect(resolvePublicHost("example.com", lookup)).rejects.toThrow(
      "Target resolved to a non-public address"
    );
  });

  it("rejects loopback and link-local resolved addresses", async () => {
    const lookup = vi.fn(async () => [
      { address: "127.0.0.1", family: 4 },
      { address: "fe80::1", family: 6 }
    ]);

    await expect(resolvePublicHost("example.com", lookup)).rejects.toThrow(
      "Target resolved to a non-public address"
    );
  });
});
