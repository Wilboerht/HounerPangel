"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PostForm, type PostFormValues, type PostFormDraft } from "@/components/admin/post-form";
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
    } catch {
      toast.error("删除失败");
    }
    setDeleteTarget(null);
  };

  const resetAndCloseModal = () => {
    setShowNewModal(false);
    setModalInitial(blankValues(todayLocal()));
    setModalTagInput(undefined);
    setFormKey((k) => k + 1);
    setFormDirty(false);
    setPendingClose(false);
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
        toast.error(data.error || "保存失败");
        return false;
      }
    } catch {
      toast.error("保存失败");
      return false;
    }
  };

  const closeNewModal = () => {
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
      openNewModal();
      router.replace("/admin/blog");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">博客</h1>
          <p className="text-sm text-muted mt-1">管理你的博客文章</p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建文章
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="加载中">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[62px] rounded-lg border border-border/50 bg-foreground/[0.03] animate-pulse"
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
                placeholder="搜索文章标题、slug 或标签..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="清除搜索"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
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
                      {!post.published && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          草稿
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted flex flex-wrap items-center gap-x-2">
                      <span>{post.date}</span>
                      {post.tags.length > 0 && (
                        <span className="truncate">{post.tags.join(" · ")}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      href={`/admin/blog/edit/${post.slug}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors min-h-[36px] min-w-[36px]"
                      title="编辑"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(post)}
                      className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors min-h-[36px] min-w-[36px]"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
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
                className="relative w-full max-w-3xl bg-background rounded-2xl border border-border/50 shadow-xl overflow-hidden max-h-[90vh] flex flex-col max-sm:rounded-none max-sm:max-h-none max-sm:h-dvh"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={closeNewModal}
                    aria-label="关闭新建窗口"
                    className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-6 sm:px-8 pt-8 pb-4 flex-shrink-0 pr-14 sm:pr-16">
                  <h2 id="new-post-title" className="text-xl font-bold text-foreground">
                    新建文章
                  </h2>
                </div>

                <div className="px-6 sm:px-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] overflow-y-auto">
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
