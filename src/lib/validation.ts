import { z } from "zod";

const nullableDateTime = z.string().max(100).nullable().default(null).refine(
    (value) => value === null || !Number.isNaN(new Date(value).getTime()),
    "日期时间不合法"
);
const nullableText = (max: number) => z.string().max(max).nullable().default(null);

export const blogPostSchema = z.object({
    slug: z.string()
        .min(1, "Slug 不能为空")
        .max(255, "Slug 过长")
        .regex(/^[a-z0-9\-]+$/, "Slug 只能包含小写字母、数字和连字符"),
    title: z.string().min(1, "标题不能为空").max(500, "标题过长"),
    content: z.string().min(1, "正文不能为空").max(100_000, "正文过长"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD").refine((val) => {
        const d = new Date(val + "T00:00:00Z");
        return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === val;
    }, "日期不合法"),
    tags: z.array(z.string().min(1).max(50)).max(20, "标签数量过多").default([]),
    published: z.boolean().default(false),
    archivedAt: nullableDateTime,
    excerpt: nullableText(2000),
    seoTitle: nullableText(500),
    seoDescription: nullableText(1000),
    coverImage: nullableText(2000),
});

export const blogPostUpdateSchema = blogPostSchema.omit({ slug: true }).extend({
    expectedUpdatedAt: z.string().min(1),
});

export const blogPostPublishSchema = z.object({
    published: z.boolean(),
    expectedUpdatedAt: z.string().min(1),
});

export const blogPostVersionSchema = z.object({
    expectedUpdatedAt: z.string().min(1),
});

export const revisionRestoreSchema = blogPostVersionSchema.extend({
    revisionId: z.string().uuid(),
});

export const loginSchema = z.object({
    password: z.string().min(1, "密码不能为空").max(256, "密码过长"),
});

export const slugParamSchema = z.object({
    slug: z.string().min(1).max(255),
});

