"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PostForm, type PostFormValues, type PostFormDraft } from "@/components/admin/post-form";
import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { PreviewMenu } from "@/components/admin/preview-menu";
import { BackLink } from "@/components/admin/back-link";
import { buttonClassName } from "@/components/admin/button";
import { ErrorState, LoadingRows } from "@/components/admin/states";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import { useLocalDraft } from "@/lib/use-local-draft";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { useDraftRestore } from "@/lib/use-draft-restore";
import { LivePostPreview } from "@/components/admin/live-post-preview";

export function BlogEditClient({ slug }: { slug: string }) {
  const router = useRouter();
  const toast = useToast();
  const loadAbortRef = useRef<AbortController | null>(null);

  const [loading, setLoading] = useState(true);
  // 网络/服务错误时留在原地给重试入口（只有文章真正不存在才跳回列表）
  const [loadFailed, setLoadFailed] = useState(false);
  const [initial, setInitial] = useState<PostFormValues | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [initialTagInput, setInitialTagInput] = useState<string | undefined>(undefined);
  // 恢复草稿时通过 formKey 重挂载 PostForm，让新的 initialValues 生效
  const [formKey, setFormKey] = useState(0);
  const [formDirty, setFormDirty] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);
  // 保存请求在途时禁止返回（避免"请求还在飞、页面已离开"的竞态）
  const [saving, setSaving] = useState(false);
  // 头部"草稿"徽标跟随表单发布状态
  const [currentPublished, setCurrentPublished] = useState(false);
  const [liveValues, setLiveValues] = useState<PostFormValues | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { scheduleSave: scheduleDraftSave, read: readDraft, clear: clearDraft } =
    useLocalDraft<PostFormDraft>(`draft:blog:${slug}`);
  const draftRestore = useDraftRestore<PostFormDraft>({
    apply: (d) => {
      const restored: PostFormValues = {
        slug,
        title: d.title ?? "",
        content: d.content ?? "",
        date: d.date ?? "",
        published: d.published ?? false,
        archivedAt: d.archivedAt ?? null,
        excerpt: d.excerpt ?? null,
        seoTitle: d.seoTitle ?? null,
        seoDescription: d.seoDescription ?? null,
        coverImage: d.coverImage ?? null,
        tags: d.tags ?? [],
      };
      setInitial(restored);
      setLiveValues(restored);
      setCurrentPublished(restored.published);
      setInitialTagInput(d.tagInput ?? "");
      setFormKey((k) => k + 1);
      setFormDirty(true);
    },
    discard: clearDraft,
  });
  const authExpired = useAuthExpired();

  const loadPost = useCallback(() => {
    loadAbortRef.current?.abort();
    const controller = new AbortController();
    loadAbortRef.current = controller;
    fetch(`/api/admin/blog/${slug}`, { signal: controller.signal })
      .then(async (res) => {
        if (controller.signal.aborted) return null;
        if (res.status === 401) {
          setLoading(false);
          authExpired();
          return null;
        }
        if (res.status === 404) {
          toast.error("文章不存在");
          router.push("/admin/blog");
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || controller.signal.aborted) return;
        const loaded: PostFormValues = {
          slug,
          title: data.title,
          content: data.content,
          date: data.date,
          published: data.published ?? false,
          archivedAt: data.archivedAt ?? null,
          excerpt: data.excerpt ?? null,
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          coverImage: data.coverImage ?? null,
          tags: data.tags ?? [],
        };
        setInitial(loaded);
        setLiveValues(loaded);
        setUpdatedAt(data.updatedAt);
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
          (saved.archivedAt ?? null) === loaded.archivedAt &&
          (saved.excerpt ?? null) === loaded.excerpt &&
          (saved.seoTitle ?? null) === loaded.seoTitle &&
          (saved.seoDescription ?? null) === loaded.seoDescription &&
          (saved.coverImage ?? null) === loaded.coverImage &&
          JSON.stringify(saved.tags ?? []) === JSON.stringify(loaded.tags) &&
          !(saved.tagInput ?? "").trim();
        if (same) {
          clearDraft();
        } else {
          draftRestore.setDraftPrompt(saved);
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        // 网络/服务错误：留在原地并给出重试入口，而不是把用户踢回列表
        setLoading(false);
        setLoadFailed(true);
      })
      .finally(() => {
        if (loadAbortRef.current === controller) loadAbortRef.current = null;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, router]);

  useEffect(() => {
    loadPost();
    return () => loadAbortRef.current?.abort();
  }, [loadPost]);

  const retryLoad = () => {
    setLoading(true);
    setLoadFailed(false);
    loadPost();
  };

  useDirtyGuard(formDirty, () => setPendingDestination("/admin/blog"));

  const requestNavigation = useCallback((href: string) => {
    if (saving) return;
    if (formDirty) {
      setPendingDestination(href);
      return;
    }
    router.push(href);
  }, [saving, formDirty, router]);

  const goBack = useCallback(() => requestNavigation("/admin/blog"), [requestNavigation]);

  const handleSave = async (values: PostFormValues): Promise<boolean> => {
    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          expectedUpdatedAt: updatedAt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUpdatedAt(data.updatedAt);
        clearDraft();
        setFormDirty(false);
        toast.success("文章已保存");
        return true;
      } else if (res.status === 401) {
        authExpired();
        return false;
      } else if (res.status === 409) {
        toast.error("保存冲突：文章已被其他会话修改，未覆盖服务器版本，请刷新后重试");
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
    setLiveValues(values);
    scheduleDraftSave(values);
  }, [scheduleDraftSave]);

  if (loading) {
    // 与列表页一致的骨架屏，避免纯文字"加载中"的体验落差
    return <LoadingRows count={4} className="h-12" />;
  }

  if (loadFailed) {
    return (
      <ErrorState
        title="加载失败"
        description="可能是网络问题，请稍后重试"
        onRetry={retryLoad}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink
        href="/admin/blog"
        label="返回列表"
        onNavigate={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          requestNavigation("/admin/blog");
        }}
      />

      <PageHeader
        title="编辑文章"
        accessory={liveValues?.archivedAt ? <Badge variant="outline">已归档</Badge> : !currentPublished && <Badge variant="warning">草稿</Badge>}
        actions={
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* 当前更改预览用弹窗（含未保存内容）；已保存版本走管理端专属路由，草稿也能看 */}
            <PreviewMenu
              savedHref={`/admin/blog/preview/${slug}`}
              disabled={!liveValues}
              onPreviewChanges={() => setPreviewOpen(true)}
            />
            <Link
              href={`/admin/blog/history/${slug}`}
              onClick={(event) => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                requestNavigation(`/admin/blog/history/${slug}`);
              }}
              className={buttonClassName({ size: "md" })}
            >
              <History className="w-4 h-4" />
              历史版本
            </Link>
          </div>
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

      {previewOpen && liveValues && <LivePostPreview values={liveValues} updatedAt={updatedAt} onClose={() => setPreviewOpen(false)} />}

      <ConfirmDialog
        isOpen={pendingDestination !== null}
        onClose={() => setPendingDestination(null)}
        onConfirm={() => {
          const href = pendingDestination ?? "/admin/blog";
          setPendingDestination(null);
          // 不要在这里 setFormDirty(false)：dirty 守卫的清理会用 history.back() 抵消
          // 即将进行的 router.push。让组件随导航卸载，守卫在卸载时会发现当前历史条目
          // 已不是占位条目而跳过 history.back()（与侧边栏导航一致）。
          // 本地草稿继续保留，下次进入编辑页可恢复。
          router.push(href);
        }}
        title="离开编辑"
        message="有未保存的更改，确定离开吗？未保存内容会保留为本地草稿，下次编辑时可恢复。"
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
