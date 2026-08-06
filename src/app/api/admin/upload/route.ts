import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    const authError = checkAuth(request);
    if (authError) return authError;

    const limit = rateLimit(getRateLimitKey(request) + ":upload");
    if (!limit.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            return NextResponse.json({ error: "Only image and video files allowed" }, { status: 400 });
        }

        const isVideo = file.type.startsWith("video/");
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: `File too large (max ${isVideo ? "100MB" : "10MB"})` }, { status: 400 });
        }

        const allowedExts: Record<string, string[]> = {
            image: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
            video: ["mp4", "webm", "mov", "avi"],
        };
        const category = isVideo ? "video" : "image";
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        if (!allowedExts[category].includes(ext)) {
            return NextResponse.json({ error: `Unsupported ${category} format` }, { status: 400 });
        }
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filePath = `blog/${fileName}`;

        const { error } = await supabase.storage
            .from("images")
            .upload(filePath, file, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error("Upload error:", error);
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(filePath);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
