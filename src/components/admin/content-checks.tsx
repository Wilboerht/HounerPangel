"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Link2 } from "lucide-react";
import type { PostFormValues } from "./post-form";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";

interface LinkResult { url: string; ok: boolean; status: number }

export function ContentChecks({ values }: { values: PostFormValues }) {
    const toast = useToast();
    const authExpired = useAuthExpired();
    const [checking, setChecking] = useState(false);
    const [links, setLinks] = useState<LinkResult[] | null>(null);
    const [checkedContent, setCheckedContent] = useState("");
    const [totalLinks, setTotalLinks] = useState(0);
    const missingAlt = Array.from(values.content.matchAll(/!\[\s*\]\((\S+?)(?:\s+[^)]*)?\)/g))
        .filter((match) => !/\.(mp4|webm|mov|avi|mkv)(?:$|[?#])/i.test(match[1]))
        .length;
    const warnings = [
        missingAlt > 0 ? `${missingAlt} 张图片缺少替代文本` : null,
        !values.excerpt ? "未填写文章摘要，将自动从正文提取" : null,
        (values.seoDescription?.length ?? 0) > 160 ? "SEO 描述超过 160 字，搜索结果中可能被截断" : null,
        values.content.trim().length < 100 ? "正文少于 100 字，请确认内容是否完整" : null,
    ].filter(Boolean) as string[];
    const resultsCurrent = checkedContent === values.content;

    const checkLinks = async () => {
        setChecking(true);
        const content = values.content;
        try {
            const res = await fetch("/api/admin/blog/check-links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
            if (res.status === 401) { authExpired(); return; }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "检查失败");
            setLinks(data.results);
            setCheckedContent(content);
            setTotalLinks(data.total);
            toast.success(`已检查 ${data.checked} 个外部链接`);
            if (data.total > data.checked) toast.info(`共发现 ${data.total} 个链接，仅显示前 ${data.checked} 个检查结果`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "链接检查失败");
        } finally { setChecking(false); }
    };

    return (
        <section className="flex flex-col gap-3 rounded-lg border border-border/50 p-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium">发布前检查</h2>
                <button type="button" disabled={checking} onClick={checkLinks} className="inline-flex min-h-[36px] items-center gap-2 rounded-lg border border-border/50 px-3 py-1.5 text-xs disabled:opacity-50"><Link2 className="h-3.5 w-3.5" />{checking ? "检查中..." : "检查外部链接"}</button>
            </div>
            {warnings.length === 0 ? <p className="flex items-center gap-2 text-xs text-green-600"><CheckCircle2 className="h-4 w-4" />基础内容检查未发现问题</p> : warnings.map((warning) => <p key={warning} className="flex items-center gap-2 text-xs text-amber-600"><AlertCircle className="h-4 w-4 flex-shrink-0" />{warning}</p>)}
            {links && !resultsCurrent && <p className="border-t border-border/50 pt-3 text-xs text-amber-600">正文已修改，之前的链接检查结果已失效，请重新检查。</p>}
            {links && resultsCurrent && (
                <div className="flex flex-col gap-1 border-t border-border/50 pt-3">
                    {totalLinks > links.length && <p className="text-xs text-amber-600">共发现 {totalLinks} 个链接，仅显示前 {links.length} 个检查结果。</p>}
                    {links.length === 0 ? <p className="text-xs text-muted">正文中没有外部链接</p> : links.map((link) => <p key={link.url} className={`break-all text-xs ${link.ok ? "text-green-600" : "text-red-600"}`}>{link.ok ? "正常" : `异常${link.status ? ` (${link.status})` : ""}`} · {link.url}</p>)}
                </div>
            )}
        </section>
    );
}
