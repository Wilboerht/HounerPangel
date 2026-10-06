"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, LogOut, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PostForm, type PostFormValues, type PostFormDraft } from "@/components/admin/post-form";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import { useLocalDraft } from "@/lib/use-local-draft";
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
  const [draftPrompt, setDraftPrompt] = useState<PostFormDraft | null>(null);
  // ConfirmDialog 在 onConfirm 后总会调 onClose，用 ref 区分"恢复"和"放弃"
  const restoreAcceptedRef = useRef(false);
  const draft = useLocalDraft<PostFormDraft>(NEW_DRAFT_KEY);

  const reduce = useSafeMotion();
  const closeModalRef = useRef<(() => void) | null>(null);
  // 确认对话框打开时，Escape 交给对话框处理，避免两个监听器互相冲突导致弹窗关不掉
  const newPostTrapRef = useFocusTrap(showNewModal, () => {
    if (pendingClose || draftPrompt) return;
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
        toast.error("登录已过期，请重新登录");
        setDeleteTarget(null);
        // 让服务端重新校验会话并渲染登录表单
        router.refresh();
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
        toast.error("登录已过期，请重新登录");
        router.refresh();
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
      setDraftPrompt(saved);
    } else if (saved) {
      draft.clear();
    }
  };

  const restoreDraft = () => {
    if (!draftPrompt) return;
    restoreAcceptedRef.current = true;
    setModalInitial({
      slug: draftPrompt.slug ?? "",
      title: draftPrompt.title ?? "",
      date: draftPrompt.date || todayLocal(),
      published: draftPrompt.published ?? false,
      tags: draftPrompt.tags ?? [],
      content: draftPrompt.content ?? "",
    });
    setModalTagInput(draftPrompt.tagInput ?? "");
    setFormKey((k) => k + 1);
    setFormDirty(true);
  };

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-content">
      <div className="max-w-3xl w-full flex-1 flex flex-col gap-10">
        {/* 触控区 44px 会让箭头在盒内居中，-mt-3 抵消这部分视觉空白 */}
        <nav className="-mt-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回主页</span>
          </Link>
        </nav>

        <section className="space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                博客管理
              </h1>
              <p className="text-lg text-muted leading-relaxed mt-2">
                管理你的博客文章
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  await fetch("/api/admin/logout", { method: "POST" });
                  router.push("/blog");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出
              </button>
              <button
                onClick={openNewModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建文章
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-muted text-center py-20">加载中...</p>
          ) : (
            <>
              {posts.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="search"
                    placeholder="搜索文章标题、slug 或标签..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
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
                <div className="flex flex-col gap-4">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.slug}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/50 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                          {!post.published && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              草稿
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted flex flex-wrap items-center gap-x-2">
                          <span>{new Date(post.date).toLocaleDateString("zh-CN")}</span>
                          {post.tags.length > 0 && (
                            <span className="truncate">{post.tags.join(" · ")}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link
                          href={`/admin/blog/edit/${post.slug}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
                          title="编辑"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors min-h-[44px] min-w-[44px]"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : search ? (
                <div className="py-20 text-center">
                  <p className="text-sm text-muted mb-3">无匹配结果</p>
                  <button onClick={() => setSearch("")} className="text-sm text-accent hover:underline">
                    清除搜索
                  </button>
                </div>
              ) : (
                <p className="py-20 text-center text-sm text-muted">暂无文章</p>
              )}
            </>
          )}
        </section>

        <footer className="mt-auto text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} wilboerht</p>
        </footer>
      </div>

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

                <div className="px-6 sm:px-8 pb-8 overflow-y-auto">
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
        isOpen={draftPrompt !== null}
        onClose={() => {
          // 放弃恢复时删除草稿（确认恢复时保留，表单会继续自动保存覆盖）
          if (!restoreAcceptedRef.current) draft.clear();
          restoreAcceptedRef.current = false;
          setDraftPrompt(null);
        }}
        onConfirm={restoreDraft}
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
    </main>
  );
}
