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

  it("accepts a public IPv6 address", () => {
    expect(normalizeTarget("2606:4700:4700::1111")).toEqual({
      kind: "ip",
      input: "2606:4700:4700::1111",
      host: "2606:4700:4700::1111"
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

  it("rejects IPv4-mapped IPv6 private and loopback addresses", () => {
    expect(() => normalizeTarget("http://[::ffff:127.0.0.1]/")).toThrow("Local and private targets are not allowed");
    expect(() => normalizeTarget("::ffff:10.0.0.1")).toThrow("Local and private targets are not allowed");
    expect(() => normalizeTarget("::ffff:192.168.1.1")).toThrow("Local and private targets are not allowed");
  });

  it("accepts IPv4-mapped IPv6 addresses when the embedded IPv4 address is public", () => {
    expect(normalizeTarget("::ffff:8.8.8.8")).toEqual({
      kind: "ip",
      input: "::ffff:8.8.8.8",
      host: "::ffff:808:808"
    });
  });

  it("rejects special-use domain suffixes", () => {
    expect(() => normalizeTarget("printer.local")).toThrow("Local and private targets are not allowed");
    expect(() => normalizeTarget("foo.localhost")).toThrow("Local and private targets are not allowed");
    expect(() => normalizeTarget("foo.test")).toThrow("Local and private targets are not allowed");
    expect(() => normalizeTarget("foo.invalid")).toThrow("Local and private targets are not allowed");
    expect(() => normalizeTarget("foo.example")).toThrow("Local and private targets are not allowed");
  });

  it("rejects non-public special-use IP ranges", () => {
    const specialUseTargets = [
      "64:ff9b::192.168.0.1",
      "2002::1",
      "2001::1",
      "2001:2::1",
      "100::1",
      "5f00::1",
      "192.175.48.1",
      "192.52.193.1"
    ];

    for (const target of specialUseTargets) {
      expect(() => normalizeTarget(target)).toThrow("Local and private targets are not allowed");
    }
  });

  it("rejects schemeless userinfo ambiguity", () => {
    expect(() => normalizeTarget("127.0.0.1@example.com")).toThrow("Enter a valid public domain or IP address");
  });

  it("rejects malformed input", () => {
    expect(() => normalizeTarget("not a valid host")).toThrow("Enter a valid public domain or IP address");
  });
});
