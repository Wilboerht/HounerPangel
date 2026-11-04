import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { supabase } from "./supabase";

// Session lifetime: 30 days (matches the cookie maxAge)
const SESSION_TTL_MS = 60 * 60 * 24 * 30 * 1000;

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export async function createSessionToken(userAgent: string | null): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    // Opportunistically clean up expired sessions on login
    await supabase.from("admin_sessions").delete().lt("expires_at", new Date().toISOString());
    const { error } = await supabase
        .from("admin_sessions")
        .insert({ token_hash: hashToken(token), expires_at: expiresAt, user_agent: userAgent?.slice(0, 500) ?? null, last_seen_at: new Date().toISOString() });
    if (error) throw error;
    return token;
}

export async function verifySessionToken(token: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from("admin_sessions")
            .select("id, last_seen_at")
            .eq("token_hash", hashToken(token))
            .gt("expires_at", new Date().toISOString())
            .maybeSingle();

        if (error || !data) return false;
        if (new Date(data.last_seen_at).getTime() < Date.now() - 5 * 60 * 1000) {
            await supabase.from("admin_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", data.id);
        }
        return true;
    } catch {
        return false;
    }
}

export async function listAdminSessions(currentToken: string) {
    const currentHash = hashToken(currentToken);
    const { data, error } = await supabase
        .from("admin_sessions")
        .select("id, token_hash, user_agent, created_at, last_seen_at, expires_at")
        .gt("expires_at", new Date().toISOString())
        .order("last_seen_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
        id: row.id,
        current: row.token_hash === currentHash,
        userAgent: row.user_agent || "未知设备",
        createdAt: row.created_at,
        lastSeenAt: row.last_seen_at,
        expiresAt: row.expires_at,
    }));
}

export async function revokeAdminSession(id: string, currentToken: string): Promise<boolean> {
    const { data, error } = await supabase
        .from("admin_sessions")
        .delete()
        .eq("id", id)
        .neq("token_hash", hashToken(currentToken))
        .select("id")
        .maybeSingle();
    if (error) throw error;
    return data !== null;
}

export async function revokeOtherAdminSessions(currentToken: string): Promise<number> {
    const { data, error } = await supabase
        .from("admin_sessions")
        .delete()
        .neq("token_hash", hashToken(currentToken))
        .select("id");
    if (error) throw error;
    return data?.length ?? 0;
}

export async function revokeSessionToken(token: string): Promise<void> {
    const { error } = await supabase
        .from("admin_sessions")
        .delete()
        .eq("token_hash", hashToken(token));
    if (error) throw error;
}
