import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const requestSchema = z.object({
    fileName: z.string().min(1).max(500),
    contentType: z.string().min(1),
    size: z.number().int().min(1),
});

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
    image: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
    video: ["mp4", "webm", "mov", "avi"],
};

export async function POST(request: NextRequest) {
    const authError = checkAuth(request);
    if (authError) return authError;

    const limit = rateLimit(getRateLimitKey(request) + ":upload-url");
    if (!limit.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const body = await request.json();
        const parsed = requestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const { fileName, contentType, size } = parsed.data;

        const isVideo = contentType.startsWith("video/");
        const isImage = contentType.startsWith("image/");
        if (!isImage && !isVideo) {
            return NextResponse.json({ error: "Only image and video files allowed" }, { status: 400 });
        }

        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (size > maxSize) {
            return NextResponse.json({ error: `File too large (max ${isVideo ? "100MB" : "10MB"})` }, { status: 400 });
        }

        const category = isVideo ? "video" : "image";
        const ext = fileName.split(".").pop()?.toLowerCase() || "png";
        if (!ALLOWED_EXTENSIONS[category].includes(ext)) {
            return NextResponse.json({ error: `Unsupported ${category} format` }, { status: 400 });
        }

        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filePath = `blog/${uniqueName}`;

        const { data, error } = await supabase.storage
            .from("images")
            .createSignedUploadUrl(filePath);

        if (error) {
            console.error("createSignedUploadUrl error:", error);
            return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
        }

        const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(filePath);

        return NextResponse.json({
            signedUrl: data.signedUrl,
            publicUrl: urlData.publicUrl,
            filePath,
        });
    } catch (error) {
        console.error("upload-url error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
