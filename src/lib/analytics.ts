import "server-only";

import { supabase } from "./supabase";

interface AnalyticsCount {
    label: string;
    count: number;
}

interface AnalyticsResult {
    daily: { date: string; count: number }[];
    pages: AnalyticsCount[];
    referrers: AnalyticsCount[];
}

export async function getAnalyticsOverview() {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 29);
    since.setUTCHours(0, 0, 0, 0);
    const { data, error } = await supabase.rpc("get_analytics_overview", { p_since: since.toISOString() });
    if (error) throw error;
    const result = data as AnalyticsResult;

    const daily = new Map<string, number>();
    for (let index = 0; index < 30; index++) {
        const date = new Date(since);
        date.setUTCDate(since.getUTCDate() + index);
        daily.set(date.toISOString().slice(0, 10), 0);
    }
    for (const row of result.daily) {
        if (daily.has(row.date)) daily.set(row.date, row.count);
    }
    const values = Array.from(daily, ([date, count]) => ({ date, count }));
    const today = new Date().toISOString().slice(0, 10);
    return {
        total: values.reduce((sum, item) => sum + item.count, 0),
        today: daily.get(today) ?? 0,
        daily: values,
        pages: result.pages,
        referrers: result.referrers,
    };
}
