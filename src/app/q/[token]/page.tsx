import type { Metadata } from "next";
import { headers } from "next/headers";
import { AlertTriangle, Pill } from "lucide-react";
import { getMedItemByToken } from "@/lib/medicine-db";
import { rateLimit } from "@/lib/rate-limit";
import { Badge } from "@/components/admin/badge";
import type { ExpiryStatus } from "@/lib/types/medicine";

export const metadata: Metadata = {
    title: "药品急救卡",
    robots: { index: false, follow: false },
};

const STATUS_TEXT: Record<ExpiryStatus, { label: string; cls: string }> = {
    expired: { label: "已过期，请勿服用", cls: "text-red-600" },
    expiring: { label: "即将到期（30 天内）", cls: "text-amber-600" },
    ok: { label: "在有效期内", cls: "text-foreground" },
};

interface Props {
    params: Promise<{ token: string }>;
}

// 免登录急救卡：扫码即看。只展示"这是什么药、怎么吃、过期没"，
// 位置等管理信息按 PRD 默认隐藏。无任何修改操作。
export default async function EmergencyCardPage({ params }: Props) {
    const { token } = await params;

    // 防爬限速
    const headerList = await headers();
    const ip =
        headerList.get("x-forwarded-for")?.split(",").pop()?.trim() ||
        headerList.get("x-real-ip") ||
        "unknown";
    const limit = await rateLimit(`${ip}:med-card`, { windowMs: 60_000, max: 30 });
    if (!limit.success) {
        return <Message title="访问过于频繁" detail="请稍后再试" />;
    }

    if (!/^[A-Za-z0-9_-]{32}$/.test(token)) {
        return <Message title="二维码已失效" detail="该标签已被撤销或不存在" />;
    }

    const item = await getMedItemByToken(token).catch(() => null);
    if (!item) {
        return <Message title="二维码已失效" detail="该标签已被撤销或不存在" />;
    }
    if (item.deletedAt) {
        return <Message title="该药品已删除" detail={`「${item.name}」已被删除，不要再服用`} />;
    }

    const status = STATUS_TEXT[item.expiryStatus];

    return (
        <main className="min-h-dvh bg-background px-6 pt-[calc(2.5rem+env(safe-area-inset-top,0px))] pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
            <div className="mx-auto flex w-full max-w-md flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-foreground/5 p-3">
                        <Pill className="h-7 w-7 text-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold leading-snug text-foreground">{item.name}</h1>
                </div>

                {item.spec && (
                    <p className="text-lg text-muted">{item.spec}</p>
                )}

                {(item.dosageForm || item.category) && (
                    <div className="flex items-center gap-2">
                        {item.dosageForm && <Badge variant="outline">{item.dosageForm}</Badge>}
                        {item.category && <Badge variant="outline">{item.category}</Badge>}
                    </div>
                )}

                <section className="rounded-2xl border border-border/50 p-5">
                    <h2 className="text-base font-semibold text-muted">用法</h2>
                    <p className="mt-2 text-2xl font-bold leading-relaxed text-foreground">
                        {item.usageText || "遵医嘱或说明书"}
                    </p>
                </section>

                <section className="rounded-2xl border border-border/50 p-5">
                    <h2 className="text-base font-semibold text-muted">效期</h2>
                    <p className="mt-2 text-xl font-semibold text-foreground">
                        {item.expiryPrecision === "month"
                            ? `${item.effectiveExpiry.slice(0, 7)}（月）`
                            : item.effectiveExpiry}
                    </p>
                    <p className={`mt-1 flex items-center gap-2 text-lg font-semibold ${status.cls}`}>
                        {item.expiryStatus !== "ok" && <AlertTriangle className="h-5 w-5" />}
                        {status.label}
                    </p>
                </section>

                {item.note && (
                    <section className="rounded-2xl border border-border/50 p-5">
                        <h2 className="text-base font-semibold text-muted">备注</h2>
                        <p className="mt-2 whitespace-pre-wrap text-lg leading-relaxed text-foreground">
                            {item.note}
                        </p>
                    </section>
                )}

                <p className="text-center text-sm text-muted">来自家庭药箱 · 此页面仅供查看</p>
            </div>
        </main>
    );
}

function Message({ title, detail }: { title: string; detail: string }) {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-background px-6">
            <div className="flex flex-col items-center gap-3 text-center">
                <AlertTriangle className="h-10 w-10 text-muted" />
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="text-base text-muted">{detail}</p>
            </div>
        </main>
    );
}
