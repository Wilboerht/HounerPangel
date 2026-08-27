import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { rateLimit, getRateLimitKey, UPLOAD_RATE_LIMIT } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import sharp from "sharp";

export const maxDuration = 60;

const ALLOWED_EXTS: Record<string, string[]> = {
    image: ["png", "jpg", "jpeg", "gif", "webp"],
    video: ["mp4", "webm", "mov", "avi"],
};

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = rateLimit(getRateLimitKey(request) + ":upload", UPLOAD_RATE_LIMIT);
    if (!limit.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "";

        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/") || !file.type;

        if (!isImage && !isVideo) {
            return NextResponse.json({ error: "Only image and video files allowed" }, { status: 400 });
        }

        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: `File too large (max ${isVideo ? "100MB" : "10MB"})` }, { status: 400 });
        }

        const category = isVideo ? "video" : "image";
        if (!ALLOWED_EXTS[category].includes(ext)) {
            return NextResponse.json({ error: `Unsupported ${category} format: .${ext}` }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const uploadBuffer = Buffer.from(arrayBuffer);

        // Extension/MIME checks are not enough: verify image content is a real
        // image by parsing its metadata with sharp
        if (isImage) {
            try {
                const metadata = await sharp(uploadBuffer).metadata();
                if (!metadata.format) throw new Error("Unknown image format");
            } catch {
                return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
            }
        }

        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filePath = `blog/${fileName}`;

        const { error } = await supabase.storage
            .from("images")
            .upload(filePath, uploadBuffer, {
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
