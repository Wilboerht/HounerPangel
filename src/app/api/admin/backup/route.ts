import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { applyBlogImport, applySitePageImport, blogBackupSchema, createBlogBackup, previewBlogImport } from "@/lib/blog-backup";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { revalidateBlogPaths } from "@/lib/revalidate-blog";
import { recordAudit } from "@/lib/audit";

const importRequestSchema = z.object({
    backup: z.unknown(),
    conflictMode: z.enum(["skip", "overwrite"]),
    dryRun: z.boolean(),
});

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const slugs = request.nextUrl.searchParams.get("slugs")?.split(",").filter(Boolean).slice(0, 100);
        const backup = await createBlogBackup(slugs);
        const date = new Date().toISOString().slice(0, 10);
        return new Response(JSON.stringify(backup, null, 2), {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition": `attachment; filename="hank-blog-backup-${date}.json"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Failed to export blog backup:", error);
        return NextResponse.json({ error: "导出备份失败" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":blog:import");
    if (!limit.success) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

    try {
        const parsedRequest = importRequestSchema.safeParse(await request.json());
        if (!parsedRequest.success) return NextResponse.json({ error: "导入请求不合法" }, { status: 400 });

        const parsedBackup = blogBackupSchema.safeParse(parsedRequest.data.backup);
        if (!parsedBackup.success) {
            const issue = parsedBackup.error.issues[0];
            return NextResponse.json({ error: `备份文件无效：${issue?.message ?? "格式错误"}` }, { status: 400 });
        }

        const { conflictMode, dryRun } = parsedRequest.data;
        const backup = parsedBackup.data;
        if (dryRun) {
            const plan = await previewBlogImport(backup);
            return NextResponse.json({
                total: plan.length,
                create: plan.filter((item) => item.status === "create").length,
                conflict: plan.filter((item) => item.status === "conflict").length,
                deleted: plan.filter((item) => item.deleted).length,
                pages: backup.pages.length,
                plan,
            });
        }

        const results = await applyBlogImport(backup, conflictMode);
        const pageImport = await applySitePageImport(backup.pages);
        await recordAudit(request, "import", "blog_backup", undefined, {
            total: results.length,
            conflictMode,
            failed: results.filter((item) => item.status === "failed").length,
            pages: pageImport.restored,
            pagesFailed: pageImport.failed.length,
        });
        for (const result of results) {
            if (result.status === "created" || result.status === "updated") revalidateBlogPaths(result.slug);
        }
        if (pageImport.restored > 0) revalidatePath("/me");
        return NextResponse.json({
            total: results.length,
            created: results.filter((item) => item.status === "created").length,
            updated: results.filter((item) => item.status === "updated").length,
            skipped: results.filter((item) => item.status === "skipped").length,
            failed: results.filter((item) => item.status === "failed").length,
            pagesRestored: pageImport.restored,
            pagesFailed: pageImport.failed.length,
            pageErrors: pageImport.failed,
            results,
        });
    } catch (error) {
        console.error("Failed to import blog backup:", error);
        return NextResponse.json({ error: "导入备份失败" }, { status: 500 });
    }
}
