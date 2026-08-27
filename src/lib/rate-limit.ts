import "server-only";

const store = new Map<string, { count: number; resetTime: number }>();

export const LOGIN_RATE_LIMIT = { windowMs: 60_000, max: 10 };
export const UPLOAD_RATE_LIMIT = { windowMs: 60_000, max: 5 };

const CLEANUP_INTERVAL = 60_000;
const MAX_KEYS = 10_000;

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

if (typeof setInterval !== "undefined") {
  const timer = setInterval(cleanupExpired, CLEANUP_INTERVAL);
  (timer as { unref?: () => void }).unref?.();
}

export function rateLimit(
  identifier: string,
  options: { windowMs: number; max: number } = LOGIN_RATE_LIMIT
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Evict the oldest entries (Map preserves insertion order) to bound memory
    if (!store.has(identifier) && store.size >= MAX_KEYS) {
      const evictCount = Math.floor(MAX_KEYS / 10);
      let i = 0;
      for (const key of store.keys()) {
        if (i++ >= evictCount) break;
        store.delete(key);
      }
    }
    const resetTime = now + options.windowMs;
    store.set(identifier, { count: 1, resetTime });
    return { success: true, remaining: options.max - 1, resetTime };
  }

  if (entry.count >= options.max) {
    return { success: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { success: true, remaining: options.max - entry.count, resetTime: entry.resetTime };
}

export function getRateLimitKey(request: Request): string {
  // Trust the right-most X-Forwarded-For entry: it is appended by the outermost
  // trusted proxy, while earlier entries can be spoofed by the client.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    const last = parts[parts.length - 1].trim();
    if (last) return last;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
