type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000): RateLimitResult {
  if (limit <= 0) {
    throw new Error("Rate limit must be greater than zero");
  }

  if (windowMs <= 0) {
    throw new Error("Rate limit window must be greater than zero");
  }

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      resetAt
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    remaining: Math.max(limit - existing.count, 0),
    resetAt: existing.resetAt
  };
}
