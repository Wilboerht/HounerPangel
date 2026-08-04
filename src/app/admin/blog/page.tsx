"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, LogOut, Lock, X, Save, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MarkdownEditor } from "@/components/markdown-editor";
import type { BlogPost } from "@/lib/types/blog";
import { useTagManager } from "@/lib/use-tag-manager";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const VALID_SLUG_RE = /^[a-z0-9-]+$/;

export default function AdminBlogList() {
  const router = useRouter();
  const toast = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [search, setSearch] = useState("");

  const [showNewModal, setShowNewModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newForm, setNewForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    published: false,
  });
  const tagManager = useTagManager([]);

  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const reduce = useSafeMotion();
  const closeModalRef = useRef<(() => void) | null>(null);
  const newPostTrapRef = useFocusTrap(showNewModal, () => closeModalRef.current?.());

  const filteredPosts = search
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : posts;

  const loadPosts = () => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setAuthError(true);
      });
  };

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          setAuthError(true);
          setLoading(false);
          return;
        }
        loadPosts();
      })
      .catch(() => {
        setAuthError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (showNewModal) return;
    setFormDirty(false);
  }, [showNewModal]);

  useEffect(() => {
    if (!formDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formDirty]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/blog/${deleteTarget.slug}`, { method: "DELETE" });
      if (res.status === 401) {
        toast.error("登录已过期，请重新登录");
        router.push("/blog");
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newForm.slug,
          title: newForm.title,
          excerpt: newForm.excerpt,
          content: newForm.content,
          date: newForm.date,
          tags: tagManager.tags,
          published: newForm.published,
        }),
      });

      if (res.ok) {
        setShowNewModal(false);
        setNewForm({
          slug: "",
          title: "",
          excerpt: "",
          content: "",
          date: new Date().toISOString().split("T")[0],
          published: false,
        });
        tagManager.setInput("");
        setFormDirty(false);
        loadPosts();
        toast.success("文章创建成功");
      } else {
        const data = await res.json();
        toast.error(data.error || "保存失败");
      }
    } catch {
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setNewForm((prev) => {
      const currentSlug = prev.slug;
      if (currentSlug && slugify(prev.title) === currentSlug) {
        return { ...prev, title, slug: slugify(title) };
      }
      return { ...prev, title };
    });
    setFormDirty(true);
  };

  const handleSlugChange = (slug: string) => {
    setNewForm((prev) => ({ ...prev, slug: slug.toLowerCase().replace(/\s+/g, "-") }));
    setFormDirty(true);
  };

  const slugValid = !newForm.slug || VALID_SLUG_RE.test(newForm.slug);

  const closeNewModal = () => {
    if (formDirty) {
      setPendingClose(true);
      return;
    }
    resetAndCloseModal();
  };

  closeModalRef.current = closeNewModal;

  const resetAndCloseModal = () => {
    setShowNewModal(false);
    setNewForm({
      slug: "",
      title: "",
      excerpt: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      published: false,
    });
    tagManager.setInput("");
    tagManager.setTags([]);
    setFormDirty(false);
    setPendingClose(false);
  };

  if (authError) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6">
        <div className="max-w-sm w-full flex flex-col items-center gap-6 text-center">
          <div className="p-4 rounded-full bg-foreground/5">
            <Lock className="w-8 h-8 text-muted" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">需要登录</h1>
            <p className="text-sm text-muted">请先登录后访问管理页面</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              返回博客
            </Link>
            <button
              onClick={() => {
                setAuthError(false);
                setLoading(true);
                loadPosts();
              }}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full flex flex-col gap-12">
        <nav>
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
                onClick={() => setShowNewModal(true)}
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
                    type="text"
                    placeholder="搜索文章标题、slug 或标签..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              )}
              {filteredPosts.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.slug}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                        <p className="text-sm text-muted">
                          {new Date(post.date).toLocaleDateString("zh-CN")}
                          {post.tags.length > 0 && (
                            <span className="ml-2">{post.tags.join(", ")}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Link
                          href={`/admin/blog/edit/${post.slug}`}
                          className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
                          title="编辑"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
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

        <footer className="pt-8 text-sm text-muted border-t border-white/10">
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
              className="fixed inset-0 flex items-center justify-center z-[101] p-6"
            >
              <div
                ref={newPostTrapRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-post-title"
                className="relative w-full max-w-2xl bg-background rounded-2xl border border-border/50 shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={closeNewModal}
                    aria-label="关闭新建窗口"
                    className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-8 pt-8 pb-4 flex-shrink-0">
                  <h2 id="new-post-title" className="text-xl font-bold text-foreground">
                    新建文章
                  </h2>
                </div>

                <div className="px-8 pb-8 overflow-y-auto">
                  <form onSubmit={handleCreate} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="new-title" className="text-sm font-medium text-foreground">
                        标题 <span className="text-muted">({newForm.title.length}/500)</span>
                      </label>
                      <input
                        id="new-title"
                        type="text"
                        required
                        maxLength={500}
                        value={newForm.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="文章标题"
                        className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="new-slug" className="text-sm font-medium text-foreground">
                        Slug（URL 标识）
                        {newForm.slug && (
                          <span className={slugValid ? "text-green-500 ml-1" : "text-red-500 ml-1"}>
                            {slugValid ? "✓" : "只能包含小写字母、数字和连字符"}
                          </span>
                        )}
                      </label>
                      <input
                        id="new-slug"
                        type="text"
                        required
                        value={newForm.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="hello-world"
                        pattern="^[a-z0-9-]+$"
                        className={`px-4 py-2 rounded-lg bg-foreground/5 border text-foreground placeholder:text-muted/50 focus:outline-none transition-colors ${
                          newForm.slug && !slugValid
                            ? "border-red-300 focus:border-red-400"
                            : "border-border/50 focus:border-accent/50"
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="new-excerpt" className="text-sm font-medium text-foreground">
                        摘要 <span className="text-muted">({newForm.excerpt.length}/2000)</span>
                      </label>
                      <textarea
                        id="new-excerpt"
                        required
                        maxLength={2000}
                        rows={3}
                        value={newForm.excerpt}
                        onChange={(e) => {
                          setNewForm({ ...newForm, excerpt: e.target.value });
                          setFormDirty(true);
                        }}
                        placeholder="简短描述"
                        className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-y"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="new-date" className="text-sm font-medium text-foreground">日期</label>
                      <input
                        id="new-date"
                        type="date"
                        required
                        value={newForm.date}
                        onChange={(e) => {
                          setNewForm({ ...newForm, date: e.target.value });
                          setFormDirty(true);
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label htmlFor="new-published" className="text-sm font-medium text-foreground">发布状态</label>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          id="new-published"
                          type="checkbox"
                          checked={newForm.published}
                          onChange={(e) => {
                            setNewForm({ ...newForm, published: e.target.checked });
                            setFormDirty(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-foreground/15 rounded-full peer-checked:bg-accent peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </div>
                      <span className="text-xs text-muted">{newForm.published ? "已发布" : "草稿"}</span>
                    </div>

                     <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground">
                        标签 <span className="text-muted">({tagManager.tags.length}/20)</span>
                      </label>
                      <div className="flex flex-wrap gap-2 mb-1">
                        {tagManager.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-foreground/10 text-foreground text-xs font-medium"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => tagManager.removeTag(tag)}
                              className="hover:text-red-500 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagManager.input}
                          onChange={(e) => tagManager.setInput(e.target.value)}
                          onKeyDown={tagManager.handleInputKeyDown}
                          placeholder="输入标签后按回车添加"
                          className="flex-1 px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => tagManager.addTag(tagManager.input)}
                          disabled={!tagManager.input.trim()}
                          className="px-4 py-2 rounded-lg bg-foreground/5 text-muted hover:text-foreground disabled:opacity-30 transition-colors text-sm"
                        >
                          添加
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground">正文（Markdown）</label>
                      <MarkdownEditor
                        value={newForm.content}
                        onChange={(v) => {
                          setNewForm({ ...newForm, content: v });
                          setFormDirty(true);
                        }}
                        rows={12}
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={saving || (!!newForm.slug && !slugValid)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "保存中..." : "保存"}
                      </button>
                      <button
                        type="button"
                        onClick={closeNewModal}
                        className="text-sm text-muted hover:text-foreground transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={pendingClose}
        onClose={() => setPendingClose(false)}
        onConfirm={resetAndCloseModal}
        title="放弃编辑"
        message="有未保存的内容，确定关闭吗？"
        confirmLabel="确定关闭"
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
