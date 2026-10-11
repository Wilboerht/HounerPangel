import { z } from "zod";

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
});

export const blogPostUpdateSchema = blogPostSchema.omit({ slug: true });

export const loginSchema = z.object({
    password: z.string().min(1, "密码不能为空").max(256, "密码过长"),
});

const dayDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD").refine((val) => {
    const d = new Date(val + "T00:00:00Z");
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === val;
}, "日期不合法");

// 效期允许 YYYY-MM（月精度）或 YYYY-MM-DD，服务端归一化为当月 1 日或原样
const expiryInputSchema = z.string().regex(/^(\d{4}-\d{2}|\d{4}-\d{2}-\d{2})$/, "效期格式必须为 YYYY-MM 或 YYYY-MM-DD");

const optionalText = (max: number) => z.string().max(max).nullable().optional();

export const medItemSchema = z.object({
    name: z.string().min(1, "名称不能为空").max(200, "名称过长"),
    tradeName: optionalText(200),
    spec: optionalText(100),
    dosageForm: optionalText(20),
    category: optionalText(20),
    quantity: optionalText(50),
    locationId: z.number().int().positive("位置必填"),
    expiry: expiryInputSchema,
    openedAt: dayDateSchema.nullable().optional(),
    afterOpeningExpiry: dayDateSchema.nullable().optional(),
    usageText: optionalText(200),
    note: optionalText(2000),
});

export const medLocationSchema = z.object({
    name: z.string().min(1, "名称不能为空").max(100, "名称过长"),
    parentId: z.number().int().positive().nullable().optional(),
});

export const slugParamSchema = z.object({
    slug: z.string().min(1).max(255),
});


