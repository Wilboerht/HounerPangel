import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";

const geocodeResultSchema = z.object({
    place_id: z.number(),
    name: z.string().optional(),
    display_name: z.string(),
    lon: z.coerce.number().min(-180).max(180),
    lat: z.coerce.number().min(-90).max(90),
});

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const parsedQuery = z.string().trim().min(1).max(100).safeParse(request.nextUrl.searchParams.get("q"));
    if (!parsedQuery.success) return NextResponse.json({ error: "请输入有效的城市名称" }, { status: 400 });

    try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.search = new URLSearchParams({
            q: parsedQuery.data,
            format: "jsonv2",
            limit: "5",
            "accept-language": "zh-CN",
        }).toString();
        const response = await fetch(url, {
            headers: { "User-Agent": "HounerPangel/1.0 (admin city search)" },
            signal: AbortSignal.timeout(10000),
            next: { revalidate: 86400 },
        });
        if (!response.ok) throw new Error(`Geocoder returned ${response.status}`);

        const parsedResults = z.array(geocodeResultSchema).safeParse(await response.json());
        if (!parsedResults.success) throw new Error("Invalid geocoder response");
        const results = parsedResults.data.map((result) => ({
            id: String(result.place_id),
            name: result.name || result.display_name.split(",")[0],
            displayName: result.display_name,
            coordinates: [result.lon, result.lat],
        }));
        return NextResponse.json({ results });
    } catch (error) {
        console.error("Failed to geocode city:", error);
        return NextResponse.json({ error: "城市搜索暂时不可用，请稍后重试或点击地图选点" }, { status: 502 });
    }
}
