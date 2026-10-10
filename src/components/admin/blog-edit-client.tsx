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
  const [initial, setInitial] = useState<PostFormValues | null>(null);
  const [initialTagInput, setInitialTagInput] = useState<string | undefined>(undefined);
  // 恢复草稿时通过 formKey 重挂载 PostForm，让新的 initialValues 生效
  const [formKey, setFormKey] = useState(0);
  const [formDirty, setFormDirty] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
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

  useEffect(() => {
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

  const handleValuesChange = useCallback((values: PostFormDraft) => {
    setCurrentPublished(values.published);
    scheduleDraftSave(values);
  }, [scheduleDraftSave]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm text-muted">加载中...</p>
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
          // 草稿也能预览：/blog/[slug] 对 admin 放行未发布文章
          <a
            href={`/blog/${slug}`}
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
