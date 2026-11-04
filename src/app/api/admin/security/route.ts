import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { getAuditLogs, recordAudit } from "@/lib/audit";
import { listAdminSessions, revokeAdminSession, revokeOtherAdminSessions } from "@/lib/session";

const revokeSchema = z.object({
    sessionId: z.string().uuid().optional(),
    others: z.boolean().optional(),
}).refine((value) => Boolean(value.sessionId) !== Boolean(value.others));

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const token = request.cookies.get("admin-session")!.value;
        const [sessions, logs] = await Promise.all([listAdminSessions(token), getAuditLogs()]);
        return NextResponse.json({ sessions, logs });
    } catch (error) {
        console.error("Failed to load security settings:", error);
        return NextResponse.json({ error: "加载安全信息失败" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const parsed = revokeSchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "请求参数不合法" }, { status: 400 });
        const token = request.cookies.get("admin-session")!.value;
        if (parsed.data.others) {
            const count = await revokeOtherAdminSessions(token);
            await recordAudit(request, "revoke_other_sessions", "session", undefined, { count });
            return NextResponse.json({ success: true, count });
        }
        const revoked = await revokeAdminSession(parsed.data.sessionId!, token);
        if (!revoked) return NextResponse.json({ error: "会话不存在，或不能通过此操作退出当前设备" }, { status: 409 });
        await recordAudit(request, "revoke_session", "session", parsed.data.sessionId);
        return NextResponse.json({ success: true, count: 1 });
    } catch (error) {
        console.error("Failed to revoke admin session:", error);
        return NextResponse.json({ error: "退出设备失败" }, { status: 500 });
    }
}
