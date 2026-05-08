// Simple in-memory rate limiter for API routes
// In production, consider using Redis for distributed rate limiting

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute for login

export function rateLimit(identifier: string): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || now > entry.resetTime) {
        // New window
        const resetTime = now + WINDOW_MS;
        store.set(identifier, { count: 1, resetTime });
        return { success: true, remaining: MAX_REQUESTS - 1, resetTime };
    }

    if (entry.count >= MAX_REQUESTS) {
        return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return { success: true, remaining: MAX_REQUESTS - entry.count, resetTime: entry.resetTime };
}

export function getRateLimitKey(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    return ip;
}
