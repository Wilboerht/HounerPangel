import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";

const schema = z.object({ content: z.string().max(100_000) });

function extractLinks(content: string): string[] {
    const links = new Set<string>();
    const pattern = /(?<!!)\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) links.add(match[1]);
    return Array.from(links).slice(0, 20);
}

async function checkLink(url: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
        const parsed = new URL(url);
        if (["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(parsed.hostname)) return { url, ok: false, status: 0 };
        let response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal, cache: "no-store" });
        if (response.status === 405 || response.status === 501) {
            response = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal, cache: "no-store", headers: { Range: "bytes=0-1024" } });
        }
        return { url, ok: response.ok, status: response.status };
    } catch {
        return { url, ok: false, status: 0 };
    } finally {
        clearTimeout(timeout);
    }
}

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const parsed = schema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "正文不合法" }, { status: 400 });
        const links = extractLinks(parsed.data.content);
        const results = await Promise.all(links.map(checkLink));
        return NextResponse.json({ total: links.length, results });
    } catch {
        return NextResponse.json({ error: "链接检查失败" }, { status: 500 });
    }
}
