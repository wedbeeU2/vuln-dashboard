import { afterEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request and decrements remaining", () => {
    expect(checkRateLimit("first-request", 3, 60_000)).toMatchObject({
      allowed: true,
      remaining: 2
    });
  });

  it("denies requests after the limit is reached", () => {
    expect(checkRateLimit("limited-key", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit("limited-key", 2, 60_000).allowed).toBe(true);

    expect(checkRateLimit("limited-key", 2, 60_000)).toMatchObject({
      allowed: false,
      remaining: 0
    });
  });

  it("keeps separate keys isolated", () => {
    expect(checkRateLimit("isolated-a", 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit("isolated-b", 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit("isolated-a", 1, 60_000).allowed).toBe(false);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-16T00:00:00.000Z"));

    expect(checkRateLimit("reset-key", 1, 1_000).allowed).toBe(true);
    expect(checkRateLimit("reset-key", 1, 1_000).allowed).toBe(false);

    vi.setSystemTime(new Date("2026-06-16T00:00:01.001Z"));

    expect(checkRateLimit("reset-key", 1, 1_000)).toMatchObject({
      allowed: true,
      remaining: 0
    });
  });

  it("rejects non-positive limits", () => {
    expect(() => checkRateLimit("bad-limit", 0, 60_000)).toThrow("Rate limit must be greater than zero");
    expect(() => checkRateLimit("bad-limit", -1, 60_000)).toThrow("Rate limit must be greater than zero");
  });

  it("rejects non-positive windows", () => {
    expect(() => checkRateLimit("bad-window", 10, 0)).toThrow("Rate limit window must be greater than zero");
    expect(() => checkRateLimit("bad-window", 10, -1)).toThrow("Rate limit window must be greater than zero");
  });
});
