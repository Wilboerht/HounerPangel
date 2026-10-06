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
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    pdf: "application/pdf",
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    zip: "application/zip",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
    image: ["png", "jpg", "jpeg", "gif", "webp"],
    video: ["mp4", "webm", "mov", "avi", "mkv"],
    attachment: ["pdf", "txt", "md", "csv", "zip", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
};

const MAX_SIZE: Record<string, number> = {
    image: 10 * 1024 * 1024,
    video: 100 * 1024 * 1024,
    attachment: 50 * 1024 * 1024,
};

const MAX_SIZE_LABEL: Record<string, string> = {
    image: "10MB",
    video: "100MB",
    attachment: "50MB",
};

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":upload-url", UPLOAD_RATE_LIMIT);
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

        const ext = fileName.split(".").pop()?.toLowerCase() || "";
        if (!contentType) {
            contentType = EXT_TO_MIME[ext] || "";
            if (!contentType) {
                return NextResponse.json({ error: `Cannot determine file type from extension: "${ext}"` }, { status: 400 });
            }
        }

        const isVideo = contentType.startsWith("video/");
        const isImage = contentType.startsWith("image/");
        // 附件按扩展名归类，contentType 以服务端映射为准，不信任客户端上报
        const isAttachment = !isImage && !isVideo && ALLOWED_EXTENSIONS.attachment.includes(ext);
        if (isAttachment) contentType = EXT_TO_MIME[ext];
        if (!isImage && !isVideo && !isAttachment) {
            console.error("upload-url invalid content type:", { fileName, contentType, size });
            return NextResponse.json({ error: `Only image, video and attachment files allowed, got: "${contentType}"` }, { status: 400 });
        }

        const category = isVideo ? "video" : isImage ? "image" : "attachment";
        if (size > MAX_SIZE[category]) {
            return NextResponse.json({ error: `File too large (max ${MAX_SIZE_LABEL[category]})` }, { status: 400 });
        }

        if (!ALLOWED_EXTENSIONS[category].includes(ext)) {
            return NextResponse.json({ error: `Unsupported ${category} format: .${ext}` }, { status: 400 });
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
