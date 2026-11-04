"use client";

import { useCallback, useEffect, useState } from "react";
import { Monitor, ScrollText, LogOut } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { Badge } from "@/components/admin/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";

interface SessionItem { id: string; current: boolean; userAgent: string; createdAt: string; lastSeenAt: string; expiresAt: string }
interface AuditItem { id: string; action: string; targetType: string; targetId: string | null; details: Record<string, unknown>; createdAt: string }

const ACTION_LABELS: Record<string, string> = {
    login_succeeded: "登录成功", login_failed: "登录失败", logout: "退出登录",
    create: "创建", update: "更新", publish: "发布", unpublish: "下线", delete: "移至回收站",
    restore: "恢复", purge: "彻底删除", restore_revision: "恢复历史版本", import: "导入备份",
    bulk: "批量操作", revoke_session: "退出设备", revoke_other_sessions: "退出其他设备",
};

function time(value: string) { return new Date(value).toLocaleString("zh-CN", { hour12: false }); }

export function SecurityClient() {
    const toast = useToast();
    const authExpired = useAuthExpired();
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [logs, setLogs] = useState<AuditItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [target, setTarget] = useState<SessionItem | "others" | null>(null);

    const load = useCallback(async (signal?: AbortSignal) => {
        try {
            const res = await fetch("/api/admin/security", { signal });
            if (res.status === 401) { authExpired(); return; }
            if (!res.ok) throw new Error("加载失败");
            const data = await res.json();
            setSessions(data.sessions);
            setLogs(data.logs);
            setFailed(false);
        } catch { if (!signal?.aborted) setFailed(true); }
        finally { if (!signal?.aborted) setLoading(false); }
    }, [authExpired]);

    useEffect(() => {
        const controller = new AbortController();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 挂载时加载会话和审计记录
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const revoke = async () => {
        if (!target) return;
        try {
            const body = target === "others" ? { others: true } : { sessionId: target.id };
            const res = await fetch("/api/admin/security", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (res.status === 401) { authExpired(); return; }
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || "操作失败"); return; }
            toast.success(`已退出 ${data.count} 个设备`);
            setTarget(null);
            await load();
        } catch { toast.error("网络错误，请重试"); }
    };

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="安全与审计" description="查看活跃设备、撤销会话及追踪关键管理操作" actions={<button onClick={() => setTarget("others")} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border/50 px-4 py-2 text-sm"><LogOut className="h-4 w-4" />退出其他设备</button>} />
            {loading ? <p className="py-16 text-center text-sm text-muted">加载中...</p> : failed ? <div className="py-16 text-center"><p className="text-sm text-muted">安全信息加载失败</p><button onClick={() => { setLoading(true); load(); }} className="mt-3 rounded-lg border border-border/50 px-4 py-2 text-sm">重试</button></div> : (
                <>
                    <DashboardCard title={`活跃会话（${sessions.length}）`}>
                        <div className="flex flex-col gap-3">
                            {sessions.map((session) => <div key={session.id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3"><Monitor className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" /><div className="min-w-0 flex-1"><p className="flex items-center gap-2 break-words text-sm">{session.userAgent}{session.current && <Badge>当前设备</Badge>}</p><p className="mt-1 text-xs text-muted">最近活动 {time(session.lastSeenAt)} · 到期 {time(session.expiresAt)}</p></div>{!session.current && <button onClick={() => setTarget(session)} className="min-h-[36px] rounded-lg border border-border/50 px-3 text-xs text-red-600">退出</button>}</div>)}
                        </div>
                    </DashboardCard>
                    <DashboardCard title={`操作审计（最近 ${logs.length} 条）`}>
                        {logs.length === 0 ? <p className="py-8 text-center text-sm text-muted">暂无审计记录</p> : <div className="flex flex-col">{logs.map((log) => <div key={log.id} className="flex items-start gap-3 border-b border-border/30 py-3 last:border-0"><ScrollText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" /><div className="min-w-0 flex-1"><p className="text-sm"><span className="font-medium">{ACTION_LABELS[log.action] ?? log.action}</span><span className="ml-2 text-xs text-muted">{log.targetType}{log.targetId ? ` · ${log.targetId}` : ""}</span></p><p className="mt-1 text-xs text-muted">{time(log.createdAt)}</p>{Object.keys(log.details).length > 0 && <pre className="mt-1 overflow-x-auto text-[10px] text-muted">{JSON.stringify(log.details)}</pre>}</div></div>)}</div>}
                    </DashboardCard>
                </>
            )}
            <ConfirmDialog isOpen={target !== null} onClose={() => setTarget(null)} onConfirm={revoke} title="撤销登录会话" message={target === "others" ? "确定退出除当前设备之外的全部设备吗？" : `确定退出设备「${target?.userAgent ?? ""}」吗？该设备需要重新登录。`} confirmLabel="确认退出" danger />
        </div>
    );
}
