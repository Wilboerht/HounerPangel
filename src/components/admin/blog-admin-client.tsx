"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PostForm, type PostFormValues, type PostFormDraft } from "@/components/admin/post-form";
import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { IconButton } from "@/components/admin/icon-button";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import { useLocalDraft } from "@/lib/use-local-draft";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { useDraftRestore } from "@/lib/use-draft-restore";
import type { BlogPostSummary } from "@/lib/types/blog";

const NEW_DRAFT_KEY = "draft:blog:new";

function blankValues(date: string): PostFormValues {
  return { slug: "", title: "", date, published: false, tags: [], content: "" };
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const reduce = useSafeMotion();
  const closeModalRef = useRef<(() => void) | null>(null);
  // 确认对话框打开时，Escape 交给对话框处理，避免两个监听器互相冲突导致弹窗关不掉
  const newPostTrapRef = useFocusTrap(showNewModal, () => {
    if (pendingClose || draftRestore.draftPrompt) return;
    closeModalRef.current?.();
  });
  useScrollLock(showNewModal);

  const filteredPosts = debouncedSearch
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.slug.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(debouncedSearch.toLowerCase()))
      )
    : posts;

  const loadPosts = useCallback((signal?: AbortSignal) => {
    fetch("/api/blog", { signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Unexpected response shape");
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        if (signal?.aborted) return;
        toast.error("加载文章列表失败，请刷新重试");
        setLoading(false);
      });
  }, [toast]);

  // 登录状态由服务端渲染保证，这里直接加载列表
  useEffect(() => {
    const controller = new AbortController();
    loadPosts(controller.signal);
    return () => controller.abort();
  }, [loadPosts]);

  // 关闭弹窗的所有路径都经过 resetAndCloseModal，dirty 状态在那里一并重置
  useDirtyGuard(formDirty, () => setPendingClose(true));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/blog/${deleteTarget.slug}`, { method: "DELETE" });
      if (res.status === 401) {
        setDeleteTarget(null);
        authExpired();
        return;
      }
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== deleteTarget.slug));
        toast.success("文章已删除");
      } else {
        toast.error("删除失败");
      }
    } catch (err) {
      toast.error(err instanceof TypeError ? "网络错误，请检查连接后重试" : "删除失败");
    }
    setDeleteTarget(null);
  };

  // 行内发布/下线：PUT 需要完整字段，先取全文再翻转 published
  const handleTogglePublish = async (post: BlogPostSummary) => {
    if (togglingSlug) return;
    setTogglingSlug(post.slug);
    try {
      const res = await fetch(`/api/blog/${post.slug}`);
      if (res.status === 401) {
        authExpired();
        return;
      }
      if (!res.ok) throw new Error("操作失败");
      const full = await res.json();
      const putRes = await fetch(`/api/blog/${post.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: full.title,
          content: full.content,
          date: full.date,
          tags: full.tags ?? [],
          published: !post.published,
        }),
      });
      if (putRes.status === 401) {
        authExpired();
        return;
      }
      if (!putRes.ok) {
        const data = await putRes.json();
        throw new Error(data.error || "操作失败");
      }
      setPosts((prev) =>
        prev.map((p) => (p.slug === post.slug ? { ...p, published: !post.published } : p))
      );
      toast.success(post.published ? "已转为草稿" : "已发布");
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

  useEffect(() => {
    closeModalRef.current = closeNewModal;
  });

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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="博客"
        description="管理你的博客文章"
        actions={
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建文章
          </button>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="加载中">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[62px] rounded-lg border border-border/50 bg-foreground/[0.03] motion-safe:animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="search"
                aria-label="搜索文章"
                placeholder="搜索文章标题、slug 或标签..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-md text-foreground placeholder:text-muted/50 geist-input"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="清除搜索"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          {filteredPosts.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredPosts.map((post) => (
                <div
                  key={post.slug}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border/50 hover:bg-foreground/[0.02] transition-colors"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">{post.title}</h3>
                      {!post.published && <Badge variant="warning">草稿</Badge>}
                    </div>
                    <p className="text-xs text-muted flex flex-wrap items-center gap-x-2">
                      <span>{post.date}</span>
                      {post.tags.length > 0 && (
                        <span className="truncate">{post.tags.join(" · ")}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <IconButton
                      onClick={() => handleTogglePublish(post)}
                      label={post.published ? "转为草稿" : "发布"}
                      title={post.published ? "转为草稿" : "发布"}
                      size="lg"
                      disabled={togglingSlug === post.slug}
                    >
                      {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </IconButton>
                    <IconButton href={`/admin/blog/edit/${post.slug}`} label="编辑" title="编辑" size="lg">
                      <Pencil className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteTarget(post)}
                      label="删除"
                      title="删除"
                      variant="danger"
                      size="lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          ) : search ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted mb-3">无匹配结果</p>
              <button onClick={() => setSearch("")} className="text-sm text-accent hover:underline">
                清除搜索
              </button>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-muted">暂无文章</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {showNewModal && (
          <>
            <motion.div
              initial={safeAnimate(reduce, { opacity: 0 })}
              animate={{ opacity: 1 }}
              exit={safeAnimate(reduce, { opacity: 0 })}
              onClick={closeNewModal}
              className="fixed inset-0 z-[100] geist-backdrop"
            />
            <motion.div
              initial={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
              transition={springModal}
              className="fixed inset-0 flex items-center justify-center z-[101] p-6 max-sm:p-0"
            >
              <div
                ref={newPostTrapRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-post-title"
                className="relative w-full max-w-3xl bg-background rounded-lg geist-dialog-shadow overflow-hidden max-h-full flex flex-col max-sm:rounded-none max-sm:h-dvh"
              >
                {/* 关闭按钮带底色：表单滚动时内容不会从图标底下穿过 */}
                <div className="absolute z-10 top-[calc(0.75rem+env(safe-area-inset-top,0px))] right-[calc(0.75rem+env(safe-area-inset-right,0px))] bg-background/80 backdrop-blur-sm rounded-lg">
                  <IconButton label="关闭新建窗口" onClick={closeNewModal} size="lg" disabled={creating}>
                    <X className="w-4 h-4" />
                  </IconButton>
                </div>

                {/* Geist 分隔：1px 阴影描边代替 border */}
                <div className="pb-4 flex-shrink-0 shadow-[0_1px_0_rgba(0,0,0,0.08)] pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pl-[calc(1.5rem+env(safe-area-inset-left,0px))] pr-[calc(4rem+env(safe-area-inset-right,0px))]">
                  <h2 id="new-post-title" className="text-base font-semibold text-foreground">
                    新建文章
                  </h2>
                </div>

                <div className="pl-[calc(1.5rem+env(safe-area-inset-left,0px))] pr-[calc(1.5rem+env(safe-area-inset-right,0px))] pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] overflow-y-auto [overscroll-behavior:contain]">
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
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="删除文章"
        message={`确定要删除「${deleteTarget?.title || ""}」吗？此操作不可撤销。`}
        confirmLabel="确认删除"
        danger={true}
      />
    </div>
  );
}
