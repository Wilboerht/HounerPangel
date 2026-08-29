import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { supabase } from "./supabase";

// Session lifetime: 30 days (matches the cookie maxAge)
const SESSION_TTL_MS = 60 * 60 * 24 * 30 * 1000;

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export async function createSessionToken(): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    // Opportunistically clean up expired sessions on login
    await supabase.from("admin_sessions").delete().lt("expires_at", new Date().toISOString());
    const { error } = await supabase
        .from("admin_sessions")
        .insert({ token_hash: hashToken(token), expires_at: expiresAt });
    if (error) throw error;
    return token;
}

export async function verifySessionToken(token: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from("admin_sessions")
            .select("id")
            .eq("token_hash", hashToken(token))
            .gt("expires_at", new Date().toISOString())
            .maybeSingle();

        if (error) return false;
        return data !== null;
    } catch {
        return false;
    }
}

export async function revokeSessionToken(token: string): Promise<void> {
    const { error } = await supabase
        .from("admin_sessions")
        .delete()
        .eq("token_hash", hashToken(token));
    if (error) throw error;
}
