"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Download, FileJson, Upload } from "lucide-react";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/admin/badge";
import { Button } from "@/components/admin/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";

interface ImportPlanItem {
    slug: string;
    title: string;
    status: "create" | "conflict";
    deleted: boolean;
}

interface ImportPreview {
    total: number;
    create: number;
    conflict: number;
    deleted: number;
    pages: number;
    plan: ImportPlanItem[];
}

interface ImportResult {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    pagesRestored: number;
    pagesFailed: number;
    pageErrors: { slug: string; error: string }[];
    results: { slug: string; status: string; error?: string }[];
}

export function BackupClient() {
    const toast = useToast();
    const authExpired = useAuthExpired();
    const fileRef = useRef<HTMLInputElement>(null);
    const [exporting, setExporting] = useState(false);
    const [backup, setBackup] = useState<unknown | null>(null);
    const [fileName, setFileName] = useState("");
    const [preview, setPreview] = useState<ImportPreview | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [conflictMode, setConflictMode] = useState<"skip" | "overwrite">("skip");
    const [working, setWorking] = useState(false);
    const [confirmImport, setConfirmImport] = useState(false);

    const exportBackup = async () => {
        setExporting(true);
        try {
            const res = await fetch("/api/admin/backup");
            if (res.status === 401) {
                authExpired();
                return;
            }
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "导出失败");
            }
            const url = URL.createObjectURL(await res.blob());
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `hank-blog-backup-${new Date().toISOString().slice(0, 10)}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
            toast.success("备份已导出");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "导出备份失败");
        } finally {
            setExporting(false);
        }
    };

    const selectFile = async (file: File | undefined) => {
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            toast.error("备份文件不能超过 20MB");
            return;
        }
        try {
            const parsed = JSON.parse(await file.text()) as unknown;
            setBackup(parsed);
            setFileName(file.name);
            setPreview(null);
            setResult(null);
        } catch {
            toast.error("无法解析文件，请选择由本站导出的 JSON 备份");
        } finally {
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const requestImport = async (dryRun: boolean) => {
        if (!backup) return;
        setWorking(true);
        try {
            const res = await fetch("/api/admin/backup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ backup, conflictMode, dryRun }),
            });
            if (res.status === 401) {
                authExpired();
                return;
            }
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || (dryRun ? "预检查失败" : "导入失败"));
                return;
            }
            if (dryRun) {
                setPreview(data as ImportPreview);
                setResult(null);
                toast.success("预检查完成，尚未写入任何数据");
            } else {
                const importResult = data as ImportResult;
                setResult(importResult);
                // 导入已写入数据，清掉过期的预检查结果；再次导入前必须重新预检查
                setPreview(null);
                setConfirmImport(false);
                if (importResult.failed > 0 || importResult.pagesFailed > 0) toast.error(`导入完成，但有 ${importResult.failed + importResult.pagesFailed} 项失败`);
                else toast.success("备份导入完成");
            }
        } catch {
            toast.error("网络错误，请检查连接后重试");
        } finally {
            setWorking(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="备份与恢复" description="导出博客与站点页面内容，或通过预检查安全导入备份" />

            <DashboardCard title="导出备份">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1 text-sm text-muted">
                        <p>包含已发布文章、草稿、回收站内容、站点页面（如「关于我」），以及每篇文章的 Markdown Front Matter 和媒体清单。</p>
                        <p className="text-xs">备份不包含媒体二进制文件；图片、视频和附件仍保存在 Supabase Storage。</p>
                    </div>
                    <Button variant="primary" size="lg" onClick={exportBackup} disabled={exporting} className="flex-shrink-0">
                        <Download className="h-4 w-4" />{exporting ? "导出中..." : "导出全部内容"}
                    </Button>
                </div>
            </DashboardCard>

            <DashboardCard title="导入备份">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input ref={fileRef} type="file" accept=".json,application/json" onChange={(event) => selectFile(event.target.files?.[0])} className="hidden" />
                        <Button variant="secondary" size="lg" onClick={() => fileRef.current?.click()} disabled={working}>
                            <FileJson className="h-4 w-4" />选择 JSON 备份
                        </Button>
                        {fileName && <span className="truncate text-sm text-muted">{fileName}</span>}
                    </div>

                    {backup !== null && !preview && (
                        <Button variant="primary" size="lg" onClick={() => requestImport(true)} disabled={working} className="self-start">
                            <Upload className="h-4 w-4" />{working ? "检查中..." : "预检查备份"}
                        </Button>
                    )}

                    {preview && (
                        <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4 text-green-700" />预检查完成，尚未写入数据
                            </div>
                            {preview.pages > 0 && (
                                <p className="text-xs text-muted">包含 {preview.pages} 个站点页面，导入时会恢复并生成历史快照。</p>
                            )}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {[
                                    ["文章总数", preview.total],
                                    ["新增", preview.create],
                                    ["Slug 冲突", preview.conflict],
                                    ["回收站文章", preview.deleted],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-lg bg-foreground/[0.03] p-3">
                                        <p className="text-xs text-muted">{label}</p>
                                        <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">同 Slug 文章处理方式</p>
                                <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
                                    <input type="radio" name="conflict-mode" checked={conflictMode === "skip"} onChange={() => setConflictMode("skip")} />
                                    跳过冲突文章，保留现有内容
                                </label>
                                <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
                                    <input type="radio" name="conflict-mode" checked={conflictMode === "overwrite"} onChange={() => setConflictMode("overwrite")} />
                                    用备份覆盖现有文章，覆盖前自动保存历史快照
                                </label>
                                <p className="text-xs text-muted">站点页面不受冲突模式影响，会直接恢复并保留恢复前快照。</p>
                            </div>

                            <div className="max-h-56 overflow-y-auto rounded-lg border border-border/50">
                                {preview.plan.slice(0, 50).map((item) => (
                                    <div key={item.slug} className="flex items-center justify-between gap-3 border-b border-border/30 px-3 py-2 last:border-0">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm">{item.title}</p>
                                            <p className="truncate font-mono text-xs text-muted">{item.slug}</p>
                                        </div>
                                        <div className="flex flex-shrink-0 gap-1">
                                            {item.deleted && <Badge variant="outline">回收站</Badge>}
                                            <Badge variant={item.status === "conflict" ? "warning" : "neutral"}>{item.status === "conflict" ? "冲突" : "新增"}</Badge>
                                        </div>
                                    </div>
                                ))}
                                {preview.plan.length > 50 && <p className="px-3 py-2 text-center text-xs text-muted">仅显示前 50 篇，实际将处理全部 {preview.total} 篇</p>}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button variant="secondary" size="lg" onClick={() => requestImport(true)} disabled={working}>重新检查</Button>
                                <Button variant="primary" size="lg" onClick={() => setConfirmImport(true)} disabled={working}>
                                    <Upload className="h-4 w-4" />开始导入
                                </Button>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="rounded-lg border border-border/50 p-4 text-sm">
                            <p className="font-medium">导入结果</p>
                            <p className="mt-2 text-muted">新增 {result.created} · 覆盖 {result.updated} · 跳过 {result.skipped} · 失败 {result.failed}</p>
                            {result.pagesRestored > 0 && <p className="mt-1 text-muted">站点页面已恢复 {result.pagesRestored} 个</p>}
                            {result.pagesFailed > 0 && <p className="mt-1 text-xs text-red-700">站点页面恢复失败 {result.pagesFailed} 个</p>}
                            {result.pageErrors.map((item) => (
                                <p key={item.slug} className="mt-1 text-xs text-red-700">{item.slug}：{item.error}</p>
                            ))}
                            {result.results.filter((item) => item.status === "failed").map((item) => (
                                <p key={item.slug} className="mt-1 text-xs text-red-700">{item.slug}：{item.error}</p>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardCard>

            <ConfirmDialog
                isOpen={confirmImport}
                onClose={() => setConfirmImport(false)}
                onConfirm={() => requestImport(false)}
                title="确认导入备份"
                message={conflictMode === "overwrite"
                    ? `将导入 ${preview?.total ?? 0} 篇文章，并覆盖 ${preview?.conflict ?? 0} 篇同 Slug 文章。${preview?.pages ? `同时恢复 ${preview.pages} 个站点页面。` : ""}现有内容会保留在历史版本中，确定继续吗？`
                    : `将导入 ${preview?.create ?? 0} 篇新文章，并跳过 ${preview?.conflict ?? 0} 篇冲突文章。${preview?.pages ? `同时恢复 ${preview.pages} 个站点页面。` : ""}确定继续吗？`}
                confirmLabel="确认导入"
                danger={conflictMode === "overwrite"}
            />
        </div>
    );
}
