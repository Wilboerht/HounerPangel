import "server-only";

import { supabase } from "./supabase";

export const LOGIN_RATE_LIMIT = { windowMs: 60_000, max: 10 };
export const UPLOAD_RATE_LIMIT = { windowMs: 60_000, max: 5 };

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = Boolean(upstashUrl && upstashToken);

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
    resetTime: Date.now() + options.windowMs,
  };
}

async function rateLimitDatabase(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc("increment_rate_limit", {
    p_key: `rl:${identifier}`,
    p_window_ms: options.windowMs,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Rate limiter returned no result");
  const count = Number(row.count);
  return {
    success: count <= options.max,
    remaining: Math.max(0, options.max - count),
    resetTime: new Date(row.reset_at).getTime(),
  };
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = LOGIN_RATE_LIMIT
): Promise<RateLimitResult> {
  try {
    return useUpstash
      ? await rateLimitUpstash(identifier, options)
      : await rateLimitDatabase(identifier, options);
  } catch (error) {
    console.error("Shared rate limit failed, rejecting request:", error);
    return {
      success: false,
      remaining: 0,
      resetTime: Date.now() + options.windowMs,
    };
  }
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
