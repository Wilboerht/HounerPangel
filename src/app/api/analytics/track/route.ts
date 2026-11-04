import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";

const trackSchema = z.object({
    path: z.string().max(500).regex(/^\/(?!admin(?:\/|$))/),
    referrerHost: z.string().max(255).nullable().default(null),
});

export async function POST(request: NextRequest) {
    const limit = await rateLimit(getRateLimitKey(request) + ":analytics");
    if (!limit.success) return NextResponse.json({ success: false }, { status: 429 });
    try {
        const parsed = trackSchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ success: false }, { status: 400 });
        const { error } = await supabase.from("page_views").insert({ path: parsed.data.path, referrer_host: parsed.data.referrerHost });
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to record page view:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
