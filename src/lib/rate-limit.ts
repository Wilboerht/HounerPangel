const store = new Map<string, { count: number; resetTime: number }>();

export const LOGIN_RATE_LIMIT = { windowMs: 60_000, max: 10 };
export const UPLOAD_RATE_LIMIT = { windowMs: 60_000, max: 5 };

let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

export function rateLimit(
  identifier: string,
  options: { windowMs: number; max: number } = LOGIN_RATE_LIMIT
): { success: boolean; remaining: number; resetTime: number } {
  cleanupExpired();

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
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
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}
