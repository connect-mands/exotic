interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_KEYS = 10_000;

/**
 * Fixed-window, per-instance limiter. On serverless hosts each instance keeps
 * its own window, so callers should pair this with a durable check.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  return function consume(key: string): boolean {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      if (buckets.size >= MAX_KEYS) {
        for (const [storedKey, stored] of buckets) {
          if (stored.resetAt <= now) buckets.delete(storedKey);
        }
        if (buckets.size >= MAX_KEYS) buckets.clear();
      }
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    bucket.count += 1;
    return bucket.count <= limit;
  };
}
