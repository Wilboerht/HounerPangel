"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "@/components/toast";
import { MarkdownEditor } from "@/components/markdown-editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useTagManager } from "@/lib/use-tag-manager";

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    date: "",
    published: false,
  });
  const tagManager = useTagManager([]);
  const [formDirty, setFormDirty] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/blog");
          return;
        }
        setIsAuth(true);
        setAuthChecking(false);
      })
      .catch(() => {
        router.push("/blog");
      });
  }, [router]);

  useEffect(() => {
    if (!isAuth) return;
    fetch(`/api/blog/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("文章不存在");
          router.push("/admin/blog");
          return;
        }
        setForm({
          title: data.title,
          content: data.content,
          date: data.date,
          published: data.published ?? false,
        });
        tagManager.setTags(data.tags);
        setLoading(false);
      })
      .catch(() => {
        toast.error("加载失败");
        router.push("/admin/blog");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, router, isAuth, toast]);

  useEffect(() => {
    if (!formDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formDirty]);

  const markDirty = () => {
    if (!formDirty) setFormDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          date: form.date,
          tags: tagManager.tags,
          published: form.published,
        }),
      });

      if (res.ok) {
        setFormDirty(false);
        tagManager.setInput("");
        toast.success("文章已保存");
        router.push("/admin/blog");
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

  if (authChecking) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-muted">检查权限中...</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-muted">加载中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 pt-content pb-content">
      <div className="max-w-3xl w-full flex flex-col gap-12">
        <nav>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回管理</span>
          </Link>
        </nav>

        <section className="space-y-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              编辑文章
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-slug" className="text-sm font-medium text-foreground">Slug</label>
              <input
                id="edit-slug"
                type="text"
                disabled
                value={slug}
                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-muted cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium text-foreground">
                标题 <span className="text-muted">({form.title.length}/500)</span>
              </label>
              <input
                id="edit-title"
                type="text"
                required
                maxLength={500}
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  markDirty();
                }}
                placeholder="文章标题"
                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-date" className="text-sm font-medium text-foreground">日期</label>
              <input
                id="edit-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value });
                  markDirty();
                }}
                className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="edit-published" className="text-sm font-medium text-foreground">发布状态</label>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  id="edit-published"
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => {
                    setForm({ ...form, published: e.target.checked });
                    markDirty();
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-foreground/15 rounded-full peer-checked:bg-accent peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </div>
              <span className="text-xs text-muted">{form.published ? "已发布" : "草稿"}</span>
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
                value={form.content}
                onChange={(v) => {
                  setForm({ ...form, content: v });
                  markDirty();
                }}
                rows={20}
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? "保存中..." : "保存"}
              </button>
              <Link
                href="/admin/blog"
                onClick={(e) => {
                  if (formDirty) {
                    e.preventDefault();
                    setPendingClose(true);
                  }
                }}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                取消
              </Link>
            </div>
          </form>
        </section>
      </div>

      <ConfirmDialog
        isOpen={pendingClose}
        onClose={() => setPendingClose(false)}
        onConfirm={() => {
          setFormDirty(false);
          router.push("/admin/blog");
        }}
        title="放弃更改"
        message="有未保存的更改，确定离开吗？"
        confirmLabel="确定离开"
        danger={false}
      />
    </main>
  );
}
