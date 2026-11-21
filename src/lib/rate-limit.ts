/**
 * In-memory sliding window rate limiter
 * Keyed by IP, phone number, or action identifier
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000); // 1 hour
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, maxRequests: 5 }
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter out timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + options.windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: options.maxRequests - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}
