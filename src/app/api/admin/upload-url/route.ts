import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { rateLimit, getRateLimitKey, UPLOAD_RATE_LIMIT } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const requestSchema = z.object({
    fileName: z.string().min(1).max(500),
    contentType: z.string().optional().default(""),
    size: z.number().int().min(1),
});

const EXT_TO_MIME: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
};

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
    image: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
    video: ["mp4", "webm", "mov", "avi"],
};

export async function POST(request: NextRequest) {
    const authError = checkAuth(request);
    if (authError) return authError;

    const limit = rateLimit(getRateLimitKey(request) + ":upload-url", UPLOAD_RATE_LIMIT);
    if (!limit.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const body = await request.json();
        const parsed = requestSchema.safeParse(body);
        if (!parsed.success) {
            const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
            console.error("upload-url validation failed:", JSON.stringify(parsed.error.issues));
            return NextResponse.json({ error: `Invalid request: ${fields}` }, { status: 400 });
        }

        const { fileName, size } = parsed.data;
        let { contentType } = parsed.data;

        if (!contentType) {
            const ext = fileName.split(".").pop()?.toLowerCase() || "";
            contentType = EXT_TO_MIME[ext] || "";
            if (!contentType) {
                return NextResponse.json({ error: `Cannot determine file type from extension: "${ext}"` }, { status: 400 });
            }
        }

        const isVideo = contentType.startsWith("video/");
        const isImage = contentType.startsWith("image/");
        if (!isImage && !isVideo) {
            console.error("upload-url invalid content type:", { fileName, contentType, size });
            return NextResponse.json({ error: `Only image and video files allowed, got: "${contentType}"` }, { status: 400 });
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
