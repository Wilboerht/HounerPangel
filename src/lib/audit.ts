import "server-only";

import { createHash } from "node:crypto";
import { supabase } from "./supabase";

async function sessionIdForToken(token: string | undefined) {
    if (!token) return null;
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data, error } = await supabase.from("admin_sessions").select("id").eq("token_hash", tokenHash).maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
}

export async function recordAuditForToken(token: string | undefined, action: string, targetType: string, targetId?: string, details: Record<string, unknown> = {}) {
    try {
        const actorSessionId = await sessionIdForToken(token);
        const { error } = await supabase.from("audit_logs").insert({ actor_session_id: actorSessionId, action, target_type: targetType, target_id: targetId ?? null, details });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to write audit log:", error);
    }
}

export async function recordAudit(request: Request, action: string, targetType: string, targetId?: string, details: Record<string, unknown> = {}) {
    const cookie = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("admin-session="));
    const token = cookie?.slice("admin-session=".length);
    await recordAuditForToken(token, action, targetType, targetId, details);
}

export async function getAuditLogs(limit = 100) {
    const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, target_type, target_id, details, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
    if (error) throw error;
    return (data || []).map((row) => ({
        id: row.id,
        action: row.action,
        targetType: row.target_type,
        targetId: row.target_id,
        details: row.details,
        createdAt: row.created_at,
    }));
}
