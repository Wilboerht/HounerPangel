import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
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

// 大小限制说明：Supabase 签名上传 URL 无法绑定文件大小，下面的分类上限只校验
// 客户端上报的 size（实际上只在 upload 前的 UI 层有效）。实际上传字节的强制边界
// 是 images bucket 的 file_size_limit（统一 100MB，见迁移
// 20261006231320_images_bucket_limits.sql）。

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":upload-url", UPLOAD_RATE_LIMIT);
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const body = await request.json();
        const parsed = requestSchema.safeParse(body);
        if (!parsed.success) {
            const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
            console.error("upload-url validation failed:", JSON.stringify(parsed.error.issues));
            return NextResponse.json({ error: `请求参数不合法：${fields}` }, { status: 400 });
        }

        const { fileName, size } = parsed.data;

        const ext = fileName.split(".").pop()?.toLowerCase() || "";
        // contentType 一律由服务端从扩展名推导，客户端上报的 contentType 不参与判断
        const contentType = EXT_TO_MIME[ext] || "";
        if (!contentType) {
            return NextResponse.json({ error: `无法从扩展名 ".${ext}" 识别文件类型` }, { status: 400 });
        }

        const isVideo = contentType.startsWith("video/");
        const isImage = contentType.startsWith("image/");
        const isAttachment = !isImage && !isVideo && ALLOWED_EXTENSIONS.attachment.includes(ext);
        if (!isImage && !isVideo && !isAttachment) {
            console.error("upload-url invalid content type:", { fileName, contentType, size });
            return NextResponse.json({ error: `仅支持图片、视频和附件文件，当前类型："${contentType}"` }, { status: 400 });
        }

        const category = isVideo ? "video" : isImage ? "image" : "attachment";
        if (size > MAX_SIZE[category]) {
            return NextResponse.json({ error: `文件过大（${category === "image" ? "图片" : category === "video" ? "视频" : "附件"}最大 ${MAX_SIZE_LABEL[category]}）` }, { status: 400 });
        }

        if (!ALLOWED_EXTENSIONS[category].includes(ext)) {
            return NextResponse.json({ error: `不支持的${category === "image" ? "图片" : category === "video" ? "视频" : "附件"}格式：.${ext}` }, { status: 400 });
        }

        const uniqueName = `${Date.now()}-${randomUUID().replace(/-/g, "")}.${ext}`;
        const filePath = `blog/${uniqueName}`;

        const { data, error } = await supabase.storage
            .from("images")
            .createSignedUploadUrl(filePath);

        if (error) {
            console.error("createSignedUploadUrl error:", error);
            return NextResponse.json({ error: "生成上传链接失败" }, { status: 500 });
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
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
    }
}
