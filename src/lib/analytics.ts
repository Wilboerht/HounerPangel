import "server-only";

import { supabase } from "./supabase";

export async function getAnalyticsOverview() {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 29);
    since.setUTCHours(0, 0, 0, 0);
    const { data, error } = await supabase
        .from("page_views")
        .select("path, referrer_host, created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(20000);
    if (error) throw error;

    const daily = new Map<string, number>();
    for (let index = 0; index < 30; index++) {
        const date = new Date(since);
        date.setUTCDate(since.getUTCDate() + index);
        daily.set(date.toISOString().slice(0, 10), 0);
    }
    const pages = new Map<string, number>();
    const referrers = new Map<string, number>();
    const today = new Date().toISOString().slice(0, 10);
    let todayViews = 0;
    for (const row of data ?? []) {
        const day = row.created_at.slice(0, 10);
        daily.set(day, (daily.get(day) ?? 0) + 1);
        if (day === today) todayViews++;
        pages.set(row.path, (pages.get(row.path) ?? 0) + 1);
        if (row.referrer_host) referrers.set(row.referrer_host, (referrers.get(row.referrer_host) ?? 0) + 1);
    }
    const top = (values: Map<string, number>) => Array.from(values, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 8);
    return {
        total: data?.length ?? 0,
        today: todayViews,
        daily: Array.from(daily, ([date, count]) => ({ date, count })),
        pages: top(pages),
        referrers: top(referrers),
    };
}
