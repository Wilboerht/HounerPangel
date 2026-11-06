import { DashboardCard } from "./dashboard-card";
import type { getAnalyticsOverview } from "@/lib/analytics";

type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsOverview>>;

export function AnalyticsOverview({ data }: { data: AnalyticsData | null }) {
    if (!data) return <p role="alert" className="rounded-lg border border-amber-600/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">访问统计暂时不可用，请确认已应用最新数据库迁移。</p>;
    const max = Math.max(1, ...data.daily.map((item) => item.count));
    const first = data.daily[0]?.date;
    const middle = data.daily[Math.floor(data.daily.length / 2)]?.date;
    const last = data.daily[data.daily.length - 1]?.date;
    const shortDate = (value: string | undefined) => value?.slice(5) ?? "";
    return (
        <div className="flex flex-col gap-4">
            <DashboardCard
                title="30 天访问趋势"
                action={<span className="text-xs tabular-nums text-muted">共 {data.total} 次</span>}
            >
                <div className="flex h-32 items-end gap-1" role="img" aria-label={`近 30 天共 ${data.total} 次页面浏览`}>
                    {data.daily.map((item) => <div key={item.date} title={`${item.date}：${item.count}`} className="flex h-full flex-1 items-end rounded-sm bg-foreground/5"><div className="w-full rounded-sm bg-accent/70" style={{ height: `${Math.max(item.count > 0 ? 4 : 0, item.count / max * 100)}%` }} /></div>)}
                </div>
                <div className="mt-2 flex justify-between text-xs tabular-nums text-muted">
                    <span>{shortDate(first)}</span>
                    <span>{shortDate(middle)}</span>
                    <span>{shortDate(last)}</span>
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
