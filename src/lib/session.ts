import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function getSecret(): string {
    if (!ADMIN_PASSWORD) {
        throw new Error("ADMIN_PASSWORD is not configured");
    }
    return ADMIN_PASSWORD;
}

function sign(data: string, secret: string): string {
    return createHmac("sha256", secret).update(data).digest("hex");
}

export function createSessionToken(): string {
    const secret = getSecret();
    const timestamp = Date.now().toString();
    const signature = sign(timestamp, secret);
    return `${timestamp}:${signature}`;
}

export function verifySessionToken(token: string): boolean {
    try {
        const secret = getSecret();
        const [timestampStr, signature] = token.split(":");

        if (!timestampStr || !signature) return false;

        const timestamp = parseInt(timestampStr, 10);
        if (isNaN(timestamp)) return false;

        // Check expiration (30 days)
        const maxAge = 60 * 60 * 24 * 30 * 1000;
        if (Date.now() - timestamp > maxAge) return false;

        // Verify signature using constant-time comparison
        const expectedSignature = sign(timestampStr, secret);
        const expectedBuf = Buffer.from(expectedSignature, "hex");
        const actualBuf = Buffer.from(signature, "hex");

        if (expectedBuf.length !== actualBuf.length) return false;

        return timingSafeEqual(expectedBuf, actualBuf);
    } catch {
        return false;
    }
}
