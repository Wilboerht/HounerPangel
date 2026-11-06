"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Eye, EyeOff, History } from "lucide-react";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PostForm, type PostFormValues, type PostFormDraft } from "@/components/admin/post-form";
import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { IconButton } from "@/components/admin/icon-button";
import { Button, buttonClassName } from "@/components/admin/button";
import { Dialog } from "@/components/admin/dialog";
import { EmptyState, ErrorState, LoadingRows } from "@/components/admin/states";
import { fieldClass, fieldSearchClass } from "@/components/admin/field-classes";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import { useLocalDraft } from "@/lib/use-local-draft";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { useDraftRestore } from "@/lib/use-draft-restore";
import type { BlogPostSummary } from "@/lib/types/blog";

const NEW_DRAFT_KEY = "draft:blog:new";

function blankValues(date: string): PostFormValues {
  return {
    slug: "", title: "", date, published: false, archivedAt: null,
    excerpt: null, seoTitle: null, seoDescription: null, coverImage: null, tags: [], content: "",
  };
}

// 本地时区的 YYYY-MM-DD；toISOString 是 UTC 日期，UTC+8 早上 8 点前会差一天
function todayLocal(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// 草稿里是否有实质内容（日期除外，空草稿的日期总会和今天不同）
function draftHasContent(draft: PostFormDraft): boolean {
  return !!(
    draft.title?.trim() ||
    draft.slug?.trim() ||
    draft.content?.trim() ||
    (draft.tags && draft.tags.length > 0) ||
    draft.published ||
    draft.tagInput?.trim()
  );
}

export function BlogAdminClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("date");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkTag, setBulkTag] = useState("");
  const [pendingBulkAction, setPendingBulkAction] = useState<"archive" | "delete" | null>(null);
  const pageSize = 20;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostSummary | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  // 创建请求在途时禁止关闭弹窗（避免"请求还在飞、表单已被关掉"的竞态）
  const [creating, setCreating] = useState(false);
  // 服务端返回的 slug 冲突（409）显示在表单 slug 字段下方
  const [slugError, setSlugError] = useState<string | null>(null);
  // 行内发布/下线切换中的 slug
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  // 新建表单状态：initialValues 变化时通过 formKey 重挂载 PostForm
  const [modalInitial, setModalInitial] = useState<PostFormValues>(() => blankValues(""));
  const [modalTagInput, setModalTagInput] = useState<string | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);
  const draft = useLocalDraft<PostFormDraft>(NEW_DRAFT_KEY);
  const draftRestore = useDraftRestore<PostFormDraft>({
    apply: (d) => {
      setModalInitial({
        slug: d.slug ?? "",
        title: d.title ?? "",
        date: d.date || todayLocal(),
        published: d.published ?? false,
        archivedAt: d.archivedAt ?? null,
        excerpt: d.excerpt ?? null,
        seoTitle: d.seoTitle ?? null,
        seoDescription: d.seoDescription ?? null,
        coverImage: d.coverImage ?? null,
        tags: d.tags ?? [],
        content: d.content ?? "",
      });
      setModalTagInput(d.tagInput ?? "");
      setFormKey((k) => k + 1);
      setFormDirty(true);
    },
    discard: draft.clear,
  });
  const authExpired = useAuthExpired();

  const loadPosts = useCallback((signal?: AbortSignal) => {
    const params = new URLSearchParams({
      search: debouncedSearch,
      status,
      tag,
      sort,
      page: String(page),
      pageSize: String(pageSize),
    });
    fetch(`/api/admin/blog?${params}`, { signal })
      .then(async (res) => {
        if (res.status === 401) {
          authExpired();
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (!Array.isArray(data.items)) throw new Error("Unexpected response shape");
        setPosts(data.items);
        setTotal(data.total);
        setAvailableTags(data.tags);
        setSelectedSlugs(new Set());
        setLoadFailed(false);
      })
      .catch(() => {
        if (signal?.aborted) return;
        setLoadFailed(true);
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, [authExpired, debouncedSearch, page, sort, status, tag]);

  const retryLoad = () => {
    setLoading(true);
    setLoadFailed(false);
    loadPosts();
  };

  // 登录状态由服务端渲染保证，这里直接加载列表
  useEffect(() => {
    const controller = new AbortController();
    loadPosts(controller.signal);
    return () => controller.abort();
  }, [loadPosts]);

  // 关闭弹窗的所有路径都经过 resetAndCloseModal，dirty 状态在那里一并重置
  useDirtyGuard(formDirty, () => setPendingClose(true));

  const removePostFromPage = (slug: string) => {
    if (posts.length === 1 && page > 1) {
      setPage((value) => value - 1);
      return;
    }
    setPosts((prev) => prev.filter((post) => post.slug !== slug));
    setTotal((value) => Math.max(0, value - 1));
  };

  const handleDelete = async () => {
    const target = deleteTarget;
    if (!target) return;
    try {
      const res = await fetch(`/api/blog/${target.slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedUpdatedAt: target.updatedAt }),
      });
      if (res.status === 401) {
        authExpired();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        removePostFromPage(target.slug);
        toast.success("文章已移至回收站");
      } else {
        toast.error(data.error || "删除失败");
      }
    } catch (err) {
      toast.error(err instanceof TypeError ? "网络错误，请检查连接后重试" : "删除失败");
    } finally {
      setDeleteTarget((current) => current?.slug === target.slug ? null : current);
    }
  };

  const handleTogglePublish = async (post: BlogPostSummary) => {
    if (togglingSlug) return;
    setTogglingSlug(post.slug);
    const published = !post.published;
    try {
      const res = await fetch(`/api/blog/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published, expectedUpdatedAt: post.updatedAt }),
      });
      if (res.status === 401) {
        authExpired();
        return;
      }
      if (res.status === 409) {
        throw new Error("发布状态冲突：文章已被其他会话修改，请刷新列表后重试");
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "操作失败");
      }
      const data = await res.json();
      const stillMatches =
        status === "all" ||
        (status === "published" && published) ||
        (status === "draft" && !published);
      if (stillMatches) {
        setPosts((prev) =>
          prev.map((p) => (p.slug === post.slug ? { ...p, published, archivedAt: null, updatedAt: data.updatedAt } : p))
        );
      } else {
        removePostFromPage(post.slug);
      }
      toast.success(published ? "已发布" : "已转为草稿");
    } catch (err) {
      toast.error(
        err instanceof TypeError
          ? "网络错误，请检查连接后重试"
          : err instanceof Error
            ? err.message
            : "操作失败"
      );
    } finally {
      setTogglingSlug(null);
    }
  };

  const executeBulk = async (action: "publish" | "unpublish" | "archive" | "unarchive" | "delete" | "addTags") => {
    if (selectedSlugs.size === 0 || bulkWorking) return;
    setBulkWorking(true);
    try {
      const slugs = Array.from(selectedSlugs);
      const res = await fetch("/api/admin/blog/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slugs,
          action,
          tags: action === "addTags" ? bulkTag.split(/[，,]/).map((item) => item.trim()).filter(Boolean) : [],
          expectedUpdatedAt: Object.fromEntries(slugs.map((slug) => [slug, posts.find((post) => post.slug === slug)?.updatedAt ?? ""])),
        }),
      });
      if (res.status === 401) {
        authExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "批量操作失败");
        return;
      }
      toast.success(`批量操作完成：成功 ${data.success}，失败 ${data.failed}`);
      setBulkTag("");
      loadPosts();
    } catch {
      toast.error("网络错误，请检查连接后重试");
    } finally {
      setBulkWorking(false);
      // 无论成功失败都关闭确认框，避免失败后弹窗卡住、用户无法重试
      setPendingBulkAction(null);
    }
  };

  const exportSelected = () => {
    if (selectedSlugs.size === 0) return;
    const anchor = document.createElement("a");
    anchor.href = `/api/admin/backup?slugs=${encodeURIComponent(Array.from(selectedSlugs).join(","))}`;
    anchor.download = `hank-blog-selected-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
  };

  const resetAndCloseModal = () => {
    setShowNewModal(false);
    setModalInitial(blankValues(todayLocal()));
    setModalTagInput(undefined);
    setFormKey((k) => k + 1);
    setFormDirty(false);
    setPendingClose(false);
    setSlugError(null);
  };

  const handleCreate = async (values: PostFormValues): Promise<boolean> => {
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        draft.clear();
        resetAndCloseModal();
        loadPosts();
        toast.success("文章创建成功");
        return true;
      } else if (res.status === 401) {
        authExpired();
        return false;
      } else {
        const data = await res.json();
        // slug 冲突除了 toast 还高亮输入框（toast 3.5 秒就消失，字段级提示更可见）
        if (res.status === 409) setSlugError(data.error || "Slug 已存在");
        toast.error(data.error || "保存失败");
        return false;
      }
    } catch (err) {
      toast.error(err instanceof TypeError ? "网络错误，请检查连接后重试" : "保存失败");
      return false;
    }
  };

  const closeNewModal = () => {
    // 创建请求在途时不允许关闭：弹窗关了但请求还在飞，成功/失败反馈会和用户预期对不上
    if (creating) return;
    if (formDirty) {
      setPendingClose(true);
      return;
    }
    resetAndCloseModal();
  };

  const openNewModal = () => {
    // 日期在打开弹窗时才填入，避免 SSR/客户端水合不一致
    setModalInitial((prev) =>
      prev.date ? prev : { ...prev, date: todayLocal() }
    );
    setShowNewModal(true);
    // 检测上次未保存的本地草稿，有实质内容才询问恢复
    const saved = draft.read();
    if (saved && draftHasContent(saved)) {
      draftRestore.setDraftPrompt(saved);
    } else if (saved) {
      draft.clear();
    }
  };

  // 支持 /admin/blog?new=1（如仪表盘"新建文章"入口）直接打开新建弹窗，打开后清掉参数
  const autoOpenHandledRef = useRef(false);
  useEffect(() => {
    if (autoOpenHandledRef.current) return;
    if (searchParams.get("new") === "1") {
      autoOpenHandledRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 一次性响应 URL 参数：openNewModal 同时读写 localStorage 草稿和打开弹窗，属于对外部输入的副作用处理，不能移到渲染期
      openNewModal();
      router.replace("/admin/blog");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const allOnPageSelected =
    posts.length > 0 && posts.every((post) => selectedSlugs.has(post.slug));
  const someOnPageSelected = selectedSlugs.size > 0 && !allOnPageSelected;
  const hasFilters = Boolean(search || tag || status !== "all");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="博客"
        description="管理你的博客文章"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/blog/trash"
              className={buttonClassName({ variant: "secondary", size: "lg" })}
            >
              <Trash2 className="h-4 w-4" />回收站
            </Link>
            <Button variant="primary" size="lg" onClick={openNewModal}>
              <Plus className="w-4 h-4" />
              新建文章
            </Button>
          </div>
        }
      />

      {loading ? (
        <LoadingRows count={4} className="h-[62px]" />
      ) : loadFailed ? (
        <ErrorState
          title="加载文章列表失败"
          description="请检查网络后重试"
          onRetry={retryLoad}
        />
      ) : (
        <div className={`flex flex-col gap-4 ${selectedSlugs.size > 0 ? "pb-48 md:pb-28" : ""}`}>
          <div className="flex flex-col gap-2 rounded-lg border border-border/50 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="search"
                aria-label="搜索文章"
                placeholder="搜索文章标题或 slug..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className={fieldSearchClass}
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setPage(1); }}
                  aria-label="清除搜索"
                  className="absolute right-2 top-1/2 flex min-h-[36px] min-w-[36px] -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-foreground max-sm:min-h-[44px] max-sm:min-w-[44px]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <select aria-label="按状态筛选" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={fieldClass}>
                <option value="all">全部状态</option><option value="published">已发布</option><option value="draft">草稿</option><option value="archived">已归档</option>
              </select>
              <select aria-label="按标签筛选" value={tag} onChange={(e) => { setTag(e.target.value); setPage(1); }} className={fieldClass}>
                <option value="">全部标签</option>{availableTags.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select aria-label="排序方式" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className={`${fieldClass} col-span-2 sm:col-span-1`}>
                <option value="date">按文章日期</option><option value="updated">按最近修改</option>
              </select>
            </div>
          </div>

          {posts.length > 0 ? (
            <div className="flex flex-col gap-2">
              <label className="flex min-h-[44px] items-center gap-2 px-2 text-sm text-muted">
                <input
                  type="checkbox"
                  aria-label="选择当前页全部文章"
                  checked={allOnPageSelected}
                  ref={(element) => {
                    if (element) element.indeterminate = someOnPageSelected;
                  }}
                  onChange={(e) => setSelectedSlugs(e.target.checked ? new Set(posts.map((post) => post.slug)) : new Set())}
                  className="h-4 w-4"
                />选择本页
              </label>
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-2 rounded-lg border border-border/50 px-3 py-3 transition-colors hover:bg-foreground/[0.03] sm:flex sm:items-center sm:px-4"
                >
                  <label className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center sm:min-h-[36px] sm:min-w-[36px]">
                    <input
                      type="checkbox"
                      aria-label={`选择 ${post.title}`}
                      checked={selectedSlugs.has(post.slug)}
                      onChange={() => setSelectedSlugs((current) => {
                        const next = new Set(current);
                        if (next.has(post.slug)) next.delete(post.slug); else next.add(post.slug);
                        return next;
                      })}
                      className="h-4 w-4"
                    />
                  </label>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <Link
                        href={`/admin/blog/edit/${post.slug}`}
                        className="min-w-0 truncate text-sm font-medium text-foreground hover:underline"
                      >
                        {post.title}
                      </Link>
                      {post.archivedAt ? <Badge variant="outline">已归档</Badge> : !post.published && <Badge variant="warning">草稿</Badge>}
                    </div>
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      <span>{post.date}</span>
                      {post.tags.length > 0 && <span className="truncate">{post.tags.join(" · ")}</span>}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1 sm:col-auto sm:ml-0">
                    <IconButton onClick={() => handleTogglePublish(post)} label={post.published ? "转为草稿" : "发布"} title={post.published ? "转为草稿" : "发布"} size="adaptive" disabled={togglingSlug !== null}>
                      {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </IconButton>
                    <IconButton href={`/admin/blog/history/${post.slug}`} label="历史版本" title="历史版本" size="adaptive"><History className="w-4 h-4" /></IconButton>
                    <IconButton href={`/admin/blog/edit/${post.slug}`} label="编辑" title="编辑" size="adaptive"><Pencil className="w-4 h-4" /></IconButton>
                    <IconButton onClick={() => setDeleteTarget(post)} label="删除" title="删除" variant="danger" size="adaptive"><Trash2 className="w-4 h-4" /></IconButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={hasFilters ? "没有匹配的文章" : "还没有文章"}
              description={hasFilters ? "试试调整搜索词或筛选条件" : "创建第一篇文章，开始记录你的想法"}
              action={
                hasFilters ? (
                  <Button onClick={() => { setSearch(""); setTag(""); setStatus("all"); setPage(1); }}>
                    清除筛选
                  </Button>
                ) : (
                  <Button variant="primary" onClick={openNewModal}>
                    <Plus className="h-4 w-4" />新建文章
                  </Button>
                )
              }
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <span>共 {total} 篇 · 第 {page} / {Math.max(1, Math.ceil(total / pageSize))} 页</span>
            <div className="flex gap-2">
              <Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>上一页</Button>
              <Button disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage((value) => value + 1)}>下一页</Button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={showNewModal}
        onClose={closeNewModal}
        title="新建文章"
        size="xl"
        fullscreenOnMobile
        closeDisabled={creating}
        closeLabel="关闭新建窗口"
        bodyClassName="pt-4 pb-0"
      >
        <PostForm
          key={formKey}
          idPrefix="new"
          initialValues={modalInitial}
          initialTagInput={modalTagInput}
          slugEditable
          autoFocusTitle
          contentRows={12}
          onSubmit={handleCreate}
          onDirty={() => setFormDirty(true)}
          onValuesChange={draft.scheduleSave}
          onCancel={closeNewModal}
          onSavingChange={setCreating}
          slugError={slugError}
          onSlugChange={() => setSlugError(null)}
          footerClassName="-mx-4 sm:-mx-5 px-4 sm:px-5"
        />
      </Dialog>

      {!loading && !loadFailed && selectedSlugs.size > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-30 flex justify-center px-4 print:hidden lg:pl-[calc(15rem+2rem)] lg:pr-[calc(2rem+env(safe-area-inset-right,0px))]">
          <div className="pointer-events-auto w-full max-w-4xl rounded-xl border border-accent/30 bg-background/95 p-3 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center gap-2">
                <span aria-live="polite" className="mr-auto text-sm font-medium text-foreground">
                  已选 {selectedSlugs.size} 篇
                </span>
                <IconButton label="清除选择" size="adaptive" onClick={() => setSelectedSlugs(new Set())}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>

              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:ml-auto sm:flex-wrap sm:overflow-visible">
                <Button disabled={bulkWorking} onClick={() => executeBulk("publish")}>发布</Button>
                <Button disabled={bulkWorking} onClick={() => executeBulk("unpublish")}>下线</Button>
                <Button disabled={bulkWorking} onClick={() => setPendingBulkAction("archive")}>归档</Button>
                <Button disabled={bulkWorking} onClick={() => executeBulk("unarchive")}>取消归档</Button>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <input
                    aria-label="批量添加标签"
                    value={bulkTag}
                    disabled={bulkWorking}
                    onChange={(e) => setBulkTag(e.target.value)}
                    placeholder="标签，逗号分隔"
                    className={`${fieldClass} max-w-36`}
                  />
                  <Button disabled={bulkWorking || !bulkTag.trim()} onClick={() => executeBulk("addTags")}>加标签</Button>
                </div>
                <Button disabled={bulkWorking} onClick={exportSelected}>导出所选</Button>
                <Button variant="danger" disabled={bulkWorking} onClick={() => setPendingBulkAction("delete")}>删除</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={pendingClose}
        onClose={() => setPendingClose(false)}
        onConfirm={() => {
          draft.clear();
          resetAndCloseModal();
        }}
        title="放弃编辑"
        message="有未保存的内容，确定关闭吗？"
        confirmLabel="确定关闭"
        danger={false}
      />

      <ConfirmDialog
        isOpen={draftRestore.draftPrompt !== null}
        onClose={draftRestore.cancelRestore}
        onConfirm={draftRestore.confirmRestore}
        title="恢复草稿"
        message="检测到未保存的本地草稿，是否恢复？"
        confirmLabel="恢复"
        danger={false}
      />

      <ConfirmDialog
        isOpen={pendingBulkAction !== null}
        onClose={() => setPendingBulkAction(null)}
        onConfirm={() => pendingBulkAction ? executeBulk(pendingBulkAction) : undefined}
        title={pendingBulkAction === "delete" ? "批量移至回收站" : "批量归档"}
        message={`确定要对已选 ${selectedSlugs.size} 篇文章执行此操作吗？每篇作品的当前版本都会保留在历史记录中。`}
        confirmLabel="确认执行"
        danger={pendingBulkAction === "delete"}
      />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="移至回收站"
        message={`确定要删除「${deleteTarget?.title || ""}」吗？文章将移至回收站，可以稍后恢复。`}
        confirmLabel="移至回收站"
        danger={true}
      />
    </div>
  );
}
