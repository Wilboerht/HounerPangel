import { z } from "zod";

export const blogPostSchema = z.object({
    slug: z.string()
        .min(1, "Slug 不能为空")
        .max(255, "Slug 过长")
        .regex(/^[a-z0-9-]+$/, "Slug 只能包含小写字母、数字和连字符"),
    title: z.string().min(1, "标题不能为空").max(500, "标题过长"),
    excerpt: z.string().min(1, "摘要不能为空").max(2000, "摘要过长"),
    content: z.string().min(1, "正文不能为空").max(100_000, "正文过长"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD"),
    tags: z.array(z.string().min(1).max(50)).max(20, "标签数量过多").default([]),
});

export const blogPostUpdateSchema = blogPostSchema.omit({ slug: true });

export const loginSchema = z.object({
    password: z.string().min(1, "密码不能为空").max(256, "密码过长"),
});

export const slugParamSchema = z.object({
    slug: z.string().min(1).max(255),
});

const exifSchema = z.object({
    camera: z.string().max(200).optional(),
    lens: z.string().max(200).optional(),
    aperture: z.string().max(50).optional(),
    shutter: z.string().max(50).optional(),
    iso: z.string().max(50).optional(),
}).optional();

export const photoSchema = z.object({
    id: z.string().uuid().optional(),
    src: z.string().url("图片 URL 格式不正确").min(1, "图片 URL 不能为空"),
    title: z.string().min(1, "标题不能为空").max(500, "标题过长"),
    location: z.string().min(1, "地点不能为空").max(500, "地点过长"),
    description: z.string().max(2000, "描述过长").optional(),
    exif: exifSchema,
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export const photoUpdateSchema = photoSchema;
