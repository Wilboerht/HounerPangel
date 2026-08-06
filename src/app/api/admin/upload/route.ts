import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { rateLimit, getRateLimitKey, UPLOAD_RATE_LIMIT } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import sharp from "sharp";

export const maxDuration = 60;

const ALLOWED_EXTS: Record<string, string[]> = {
    image: ["png", "jpg", "jpeg", "gif", "webp", "svg", "heic", "heif"],
    video: ["mp4", "webm", "mov", "avi"],
};

const CONVERT_EXTENSIONS = new Set(["heic", "heif"]);

export async function POST(request: NextRequest) {
    const authError = checkAuth(request);
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
        const needsConversion = CONVERT_EXTENSIONS.has(ext);

        const isVideo = !needsConversion && file.type.startsWith("video/");
        const isImage = needsConversion || file.type.startsWith("image/") || !file.type;

        if (!isImage && !isVideo) {
            return NextResponse.json({ error: "Only image and video files allowed" }, { status: 400 });
        }

        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        const size = needsConversion ? file.size : file.size;
        if (size > maxSize) {
            return NextResponse.json({ error: `File too large (max ${isVideo ? "100MB" : "10MB"})` }, { status: 400 });
        }

        const category = isVideo ? "video" : "image";
        if (!ALLOWED_EXTS[category].includes(ext)) {
            return NextResponse.json({ error: `Unsupported ${category} format: .${ext}` }, { status: 400 });
        }

        let uploadBuffer: Buffer;
        let uploadExt = ext;
        let uploadContentType = file.type;

        if (needsConversion) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            uploadBuffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
            uploadExt = "jpg";
            uploadContentType = "image/jpeg";
        } else {
            const arrayBuffer = await file.arrayBuffer();
            uploadBuffer = Buffer.from(arrayBuffer);
        }

        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${uploadExt}`;
        const filePath = `blog/${fileName}`;

        const { error } = await supabase.storage
            .from("images")
            .upload(filePath, uploadBuffer, {
                contentType: uploadContentType,
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
