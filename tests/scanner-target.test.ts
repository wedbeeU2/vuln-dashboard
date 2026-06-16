import { describe, expect, it } from "vitest";
import { normalizeTarget } from "@/lib/scanner/target";

describe("normalizeTarget", () => {
  it("accepts a public domain", () => {
    expect(normalizeTarget("example.com")).toEqual({
      kind: "domain",
      input: "example.com",
      host: "example.com"
    });
  });

  it("normalizes a URL down to its host", () => {
    expect(normalizeTarget("https://Example.com/path?q=1")).toEqual({
      kind: "domain",
      input: "https://Example.com/path?q=1",
      host: "example.com"
    });
  });

  it("accepts a public IPv4 address", () => {
    expect(normalizeTarget("8.8.8.8")).toEqual({
      kind: "ip",
      input: "8.8.8.8",
      host: "8.8.8.8"
    });
  });

  it("rejects localhost", () => {
    expect(() => normalizeTarget("localhost")).toThrow("Local and private targets are not allowed");
  });

  it("rejects private IPv4 addresses", () => {
    expect(() => normalizeTarget("192.168.1.10")).toThrow("Local and private targets are not allowed");
    expect(() => normalizeTarget("10.0.0.2")).toThrow("Local and private targets are not allowed");
    expect(() => normalizeTarget("172.16.0.5")).toThrow("Local and private targets are not allowed");
  });

  it("rejects loopback URLs", () => {
    expect(() => normalizeTarget("http://127.0.0.1:3000")).toThrow("Local and private targets are not allowed");
  });

  it("rejects malformed input", () => {
    expect(() => normalizeTarget("not a valid host")).toThrow("Enter a valid public domain or IP address");
  });
});
