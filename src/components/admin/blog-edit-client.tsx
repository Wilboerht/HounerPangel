"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PostForm, type PostFormValues, type PostFormDraft } from "@/components/admin/post-form";
import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import { useLocalDraft } from "@/lib/use-local-draft";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { useDraftRestore } from "@/lib/use-draft-restore";

export function BlogEditClient({ slug }: { slug: string }) {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  // 网络/服务错误时留在原地给重试入口（只有文章真正不存在才跳回列表）
  const [loadFailed, setLoadFailed] = useState(false);
  const [initial, setInitial] = useState<PostFormValues | null>(null);
  const [initialTagInput, setInitialTagInput] = useState<string | undefined>(undefined);
  // 恢复草稿时通过 formKey 重挂载 PostForm，让新的 initialValues 生效
  const [formKey, setFormKey] = useState(0);
  const [formDirty, setFormDirty] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  // 保存请求在途时禁止返回（避免"请求还在飞、页面已离开"的竞态）
  const [saving, setSaving] = useState(false);
  // 头部"草稿"徽标跟随表单发布状态
  const [currentPublished, setCurrentPublished] = useState(false);
  const { scheduleSave: scheduleDraftSave, read: readDraft, clear: clearDraft } =
    useLocalDraft<PostFormDraft>(`draft:blog:${slug}`);
  const draftRestore = useDraftRestore<PostFormDraft>({
    apply: (d) => {
      setInitial({
        slug,
        title: d.title ?? "",
        content: d.content ?? "",
        date: d.date ?? "",
        published: d.published ?? false,
        tags: d.tags ?? [],
      });
      setInitialTagInput(d.tagInput ?? "");
      setFormKey((k) => k + 1);
      setFormDirty(true);
    },
    discard: clearDraft,
  });
  const authExpired = useAuthExpired();

  const loadPost = useCallback(() => {
    fetch(`/api/blog/${slug}`)
      .then(async (res) => {
        if (res.status === 401) {
          setLoading(false);
          authExpired();
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
          draftRestore.setDraftPrompt(saved);
        }
      })
      .catch(() => {
        // 网络/服务错误：留在原地并给出重试入口，而不是把用户踢回列表
        setLoading(false);
        setLoadFailed(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, router]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  // 重试按钮用：重置加载状态后重新拉取（重置放在事件处理器里，而非 loadPost 内，
  // 避免挂载 effect 里同步 setState 触发级联渲染）
  const retryLoad = () => {
    setLoading(true);
    setLoadFailed(false);
    loadPost();
  };

  useDirtyGuard(formDirty, () => setPendingClose(true));

  const goBack = useCallback(() => {
    // 保存请求在途时不允许离开，避免请求完成后页面已切走的状态错乱
    if (saving) return;
    if (formDirty) {
      setPendingClose(true);
      return;
    }
    router.push("/admin/blog");
  }, [saving, formDirty, router]);

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
        authExpired();
        return false;
      } else {
        const data = await res.json();
        toast.error(data.error || "保存失败");
        return false;
      }
    } catch (err) {
      toast.error(err instanceof TypeError ? "网络错误，请检查连接后重试" : "保存失败");
      return false;
    }
  };

  const handleValuesChange = useCallback((values: PostFormDraft) => {
    setCurrentPublished(values.published);
    scheduleDraftSave(values);
  }, [scheduleDraftSave]);

  if (loading) {
    // 与列表页一致的骨架屏，避免纯文字"加载中"的体验落差
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="加载中">
        <div className="h-9 w-24 rounded-lg bg-foreground/[0.05] motion-safe:animate-pulse" />
        <div className="h-10 rounded-lg bg-foreground/[0.05] motion-safe:animate-pulse" />
        <div className="h-10 rounded-lg bg-foreground/[0.05] motion-safe:animate-pulse" />
        <div className="h-72 rounded-lg bg-foreground/[0.05] motion-safe:animate-pulse" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-center gap-3 py-32">
        <p className="text-sm text-muted">加载失败，可能是网络问题</p>
        <button
          onClick={retryLoad}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <nav>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group min-h-[36px]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>返回列表</span>
        </button>
      </nav>

      <PageHeader
        title="编辑文章"
        accessory={!currentPublished && <Badge variant="warning">草稿</Badge>}
        actions={
          // 草稿预览走管理端专属路由；公开的 /blog/[slug] 只含已发布文章（ISR 缓存）
          <a
            href={`/admin/blog/preview/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <Eye className="w-4 h-4" />
            预览
          </a>
        }
      />

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
          onSavingChange={setSaving}
        />
      )}

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
        isOpen={draftRestore.draftPrompt !== null}
        onClose={draftRestore.cancelRestore}
        onConfirm={draftRestore.confirmRestore}
        title="恢复草稿"
        message="检测到未保存的本地草稿，是否恢复？"
        confirmLabel="恢复"
        danger={false}
      />
    </div>
  );
}
