import "server-only";

const store = new Map<string, { count: number; resetTime: number }>();

export const LOGIN_RATE_LIMIT = { windowMs: 60_000, max: 10 };
export const UPLOAD_RATE_LIMIT = { windowMs: 60_000, max: 5 };

const CLEANUP_INTERVAL = 60_000;
const MAX_KEYS = 10_000;

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory limiting only works per instance: on serverless platforms each
// instance (and cold start) gets its own counter. When Upstash credentials
// are configured, counters live in Redis and are shared across instances.
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = Boolean(upstashUrl && upstashToken);

// serverless（Vercel）下每个实例/冷启动都有独立的内存计数器，
// 内存限流的实际上限会被实例数放大；生产环境必须配置 Upstash。
if (process.env.NODE_ENV === "production" && !useUpstash) {
  console.warn(
    "[rate-limit] 未配置 UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN，" +
    "限流退化为单实例内存计数，serverless 多实例下防护效果有限。"
  );
}

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

function rateLimitMemory(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
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

async function rateLimitUpstash(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const key = `rl:${identifier}`;
  const res = await fetch(`${upstashUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${upstashToken}`,
      "Content-Type": "application/json",
    },
    // Fixed window: INCR creates the key on first hit, PEXPIRE NX only sets
    // the TTL once per window.
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, options.windowMs, "NX"],
    ]),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Upstash pipeline responded ${res.status}`);

  const [incr] = (await res.json()) as [{ result: number }];
  const count = incr.result;

  return {
    success: count <= options.max,
    remaining: Math.max(0, options.max - count),
    // Exact TTL unknown without an extra round-trip; window start approximation
    // is sufficient for Retry-After purposes.
    resetTime: Date.now() + options.windowMs,
  };
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = LOGIN_RATE_LIMIT
): Promise<RateLimitResult> {
  if (useUpstash) {
    try {
      return await rateLimitUpstash(identifier, options);
    } catch (error) {
      // A configured shared limiter must not silently degrade to per-instance
      // counters during a Redis outage.
      console.error("Upstash rate limit failed, rejecting request:", error);
      return {
        success: false,
        remaining: 0,
        resetTime: Date.now() + options.windowMs,
      };
    }
  }
  return rateLimitMemory(identifier, options);
}

export function getRateLimitKey(request: Request): string {
  // Vercel 部署时优先用 x-vercel-forwarded-for：该头由 Vercel 边缘节点覆写，
  // 客户端无法伪造；x-forwarded-for 的前段则可被客户端任意附加。
  if (process.env.VERCEL) {
    const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
    const clientIp = vercelForwarded?.split(",")[0]?.trim();
    if (clientIp) return clientIp;
  }
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
