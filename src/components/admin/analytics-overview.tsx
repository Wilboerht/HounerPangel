import { DashboardCard } from "./dashboard-card";
import type { getAnalyticsOverview } from "@/lib/analytics";

type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsOverview>>;

export function AnalyticsOverview({ data }: { data: AnalyticsData | null }) {
    if (!data) return <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">访问统计暂时不可用，请确认已应用最新数据库迁移。</p>;
    const max = Math.max(1, ...data.daily.map((item) => item.count));
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <DashboardCard><p className="text-xs text-muted">近 30 天浏览量</p><p className="mt-1 text-2xl font-semibold tabular-nums">{data.total}</p></DashboardCard>
                <DashboardCard><p className="text-xs text-muted">今日浏览量</p><p className="mt-1 text-2xl font-semibold tabular-nums">{data.today}</p></DashboardCard>
            </div>
            <DashboardCard title="30 天访问趋势">
                <div className="flex h-32 items-end gap-1" role="img" aria-label={`近 30 天共 ${data.total} 次页面浏览`}>
                    {data.daily.map((item) => <div key={item.date} title={`${item.date}：${item.count}`} className="flex h-full flex-1 items-end rounded-sm bg-foreground/5"><div className="w-full rounded-sm bg-accent/70" style={{ height: `${Math.max(item.count > 0 ? 4 : 0, item.count / max * 100)}%` }} /></div>)}
                </div>
            </DashboardCard>
            <div className="grid gap-4 lg:grid-cols-2">
                <DashboardCard title="热门页面">
                    {data.pages.length === 0 ? <p className="py-6 text-center text-sm text-muted">暂无访问记录</p> : <ol className="flex flex-col gap-2">{data.pages.map((page) => <li key={page.label} className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-mono text-xs">{page.label}</span><span className="tabular-nums text-muted">{page.count}</span></li>)}</ol>}
                </DashboardCard>
                <DashboardCard title="外部来源">
                    {data.referrers.length === 0 ? <p className="py-6 text-center text-sm text-muted">暂无外部来源</p> : <ol className="flex flex-col gap-2">{data.referrers.map((referrer) => <li key={referrer.label} className="flex items-center justify-between gap-3 text-sm"><span className="truncate">{referrer.label}</span><span className="tabular-nums text-muted">{referrer.count}</span></li>)}</ol>}
                </DashboardCard>
            </div>
        </div>
    );
}
