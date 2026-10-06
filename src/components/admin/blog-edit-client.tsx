"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PostForm, type PostFormValues, type PostFormDraft } from "@/components/admin/post-form";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import { useLocalDraft } from "@/lib/use-local-draft";

export function BlogEditClient({ slug }: { slug: string }) {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<PostFormValues | null>(null);
  const [initialTagInput, setInitialTagInput] = useState<string | undefined>(undefined);
  // 恢复草稿时通过 formKey 重挂载 PostForm，让新的 initialValues 生效
  const [formKey, setFormKey] = useState(0);
  const [formDirty, setFormDirty] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState<PostFormDraft | null>(null);
  // ConfirmDialog 在 onConfirm 后总会调 onClose，用 ref 区分"恢复"和"放弃"
  const restoreAcceptedRef = useRef(false);
  // 头部"草稿"徽标跟随表单发布状态
  const [currentPublished, setCurrentPublished] = useState(false);
  const { scheduleSave: scheduleDraftSave, read: readDraft, clear: clearDraft } =
    useLocalDraft<PostFormDraft>(`draft:blog:${slug}`);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(async (res) => {
        if (res.status === 401) {
          toast.error("登录已过期，请重新登录");
          // 让服务端重新校验会话并渲染登录表单
          router.refresh();
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.error) {
          toast.error("文章不存在");
          router.push("/admin/blog");
          return;
        }
        const loaded: PostFormValues = {
          slug,
          title: data.title,
          content: data.content,
          date: data.date,
          published: data.published ?? false,
          tags: data.tags ?? [],
        };
        setInitial(loaded);
        setCurrentPublished(loaded.published);
        setLoading(false);

        // 检测本地草稿：和刚加载的内容不同才询问恢复
        const saved = readDraft();
        if (!saved) return;
        const same =
          (saved.title ?? "") === loaded.title &&
          (saved.content ?? "") === loaded.content &&
          (saved.date ?? "") === loaded.date &&
          (saved.published ?? false) === loaded.published &&
          JSON.stringify(saved.tags ?? []) === JSON.stringify(loaded.tags) &&
          !(saved.tagInput ?? "").trim();
        if (same) {
          clearDraft();
        } else {
          setDraftPrompt(saved);
        }
      })
      .catch(() => {
        toast.error("加载失败");
        router.push("/admin/blog");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, router]);

  useDirtyGuard(formDirty, () => setPendingClose(true));

  const goBack = useCallback(() => {
    if (formDirty) {
      setPendingClose(true);
      return;
    }
    router.push("/admin/blog");
  }, [formDirty, router]);

  const handleSave = async (values: PostFormValues): Promise<boolean> => {
    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          content: values.content,
          date: values.date,
          tags: values.tags,
          published: values.published,
        }),
      });

      if (res.ok) {
        clearDraft();
        setFormDirty(false);
        toast.success("文章已保存");
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

  const handleValuesChange = useCallback((values: PostFormDraft) => {
    setCurrentPublished(values.published);
    scheduleDraftSave(values);
  }, [scheduleDraftSave]);

  const restoreDraft = () => {
    if (!draftPrompt) return;
    restoreAcceptedRef.current = true;
    setInitial({
      slug,
      title: draftPrompt.title ?? "",
      content: draftPrompt.content ?? "",
      date: draftPrompt.date ?? "",
      published: draftPrompt.published ?? false,
      tags: draftPrompt.tags ?? [],
    });
    setInitialTagInput(draftPrompt.tagInput ?? "");
    setFormKey((k) => k + 1);
    setFormDirty(true);
  };

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-muted">加载中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 pt-[calc(3rem+env(safe-area-inset-top,0px))] pb-content">
      <div className="max-w-3xl w-full flex-1 flex flex-col gap-10">
        {/* 触控区 44px 会让箭头在盒内居中，-mt-3 抵消这部分视觉空白 */}
        <nav className="-mt-3">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回管理</span>
          </button>
        </nav>

        <section className="space-y-10">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                编辑文章
              </h1>
              {!currentPublished && (
                <span className="flex-shrink-0 px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  草稿
                </span>
              )}
            </div>
            {/* 草稿也能预览：/blog/[slug] 对 admin 放行未发布文章 */}
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              预览
            </a>
          </div>

          {initial && (
            <PostForm
              key={formKey}
              idPrefix="edit"
              initialValues={initial}
              initialTagInput={initialTagInput}
              slugEditable={false}
              contentRows={20}
              onSubmit={handleSave}
              onDirty={() => setFormDirty(true)}
              onValuesChange={handleValuesChange}
              onCancel={goBack}
            />
          )}
        </section>

        <footer className="mt-auto text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} wilboerht</p>
        </footer>
      </div>

      <ConfirmDialog
        isOpen={pendingClose}
        onClose={() => setPendingClose(false)}
        onConfirm={() => {
          clearDraft();
          setFormDirty(false);
          router.push("/admin/blog");
        }}
        title="放弃更改"
        message="有未保存的更改，确定离开吗？"
        confirmLabel="确定离开"
        danger={false}
      />

      <ConfirmDialog
        isOpen={draftPrompt !== null}
        onClose={() => {
          // 放弃恢复时删除草稿（确认恢复时保留，表单会继续自动保存覆盖）
          if (!restoreAcceptedRef.current) clearDraft();
          restoreAcceptedRef.current = false;
          setDraftPrompt(null);
        }}
        onConfirm={restoreDraft}
        title="恢复草稿"
        message="检测到未保存的本地草稿，是否恢复？"
        confirmLabel="恢复"
        danger={false}
      />
    </main>
  );
}
