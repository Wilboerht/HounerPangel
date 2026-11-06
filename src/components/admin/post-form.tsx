"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Button } from "@/components/admin/button";
import { fieldBase, fieldClass } from "@/components/admin/field-classes";
import { useTagManager, type TagRejectReason } from "@/lib/use-tag-manager";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { ContentChecks } from "@/components/admin/content-checks";

// \w 只匹配 ASCII，纯中文标题会得到空串，调用方需做兜底
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const VALID_SLUG_RE = /^[a-z0-9\-]+$/;

export interface PostFormValues {
  slug: string;
  title: string;
  date: string;
  published: boolean;
  archivedAt: string | null;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  coverImage: string | null;
  tags: string[];
  content: string;
}

// 本地草稿额外记录标签输入框里未确认的内容
export type PostFormDraft = PostFormValues & { tagInput?: string };

interface PostFormProps {
  // 表单字段的 id 前缀，同一页面出现多个表单时避免 id 冲突
  idPrefix: string;
  initialValues: PostFormValues;
  // 恢复草稿时标签输入框里未确认的内容
  initialTagInput?: string;
  // 新建时可编辑并随标题自动生成，编辑时禁用展示
  slugEditable: boolean;
  contentRows?: number;
  autoFocusTitle?: boolean;
  // 返回是否保存成功；成功后由父级负责清理 dirty 状态/关闭表单
  onSubmit: (values: PostFormValues) => Promise<boolean>;
  onDirty: () => void;
  // 每次表单内容变化时回调（含标签输入框内容），供父级做草稿自动保存
  onValuesChange?: (values: PostFormValues & { tagInput: string }) => void;
  onCancel?: () => void;
  // 保存请求的开始/结束，供父级在请求在途时禁止关闭表单（避免竞态）
  onSavingChange?: (saving: boolean) => void;
  // 服务端返回的 slug 冲突等字段级错误（如 409），显示在 slug 输入框下方
  slugError?: string | null;
  // 用户修改 slug 时回调，父级据此清除 slugError
  onSlugChange?: () => void;
  // 追加到底部操作栏的类名：弹窗里用它把操作栏出血撑满弹窗边缘（页脚形态），
  // 缺省时操作栏只与内容同宽（编辑页的 sticky 形态）
  footerClassName?: string;
}

export function PostForm({
  idPrefix,
  initialValues,
  initialTagInput,
  slugEditable,
  contentRows = 12,
  autoFocusTitle = false,
  onSubmit,
  onDirty,
  onValuesChange,
  onCancel,
  onSavingChange,
  slugError,
  onSlugChange,
  footerClassName,
}: PostFormProps) {
  const [form, setForm] = useState({
    slug: initialValues.slug,
    title: initialValues.title,
    date: initialValues.date,
    published: initialValues.published,
    archivedAt: initialValues.archivedAt,
    excerpt: initialValues.excerpt,
    seoTitle: initialValues.seoTitle,
    seoDescription: initialValues.seoDescription,
    coverImage: initialValues.coverImage,
    content: initialValues.content,
  });
  const toast = useToast();
  // 达上限/重复被拒绝时给出提示，避免输入框里的内容被静默忽略
  const handleTagReject = useCallback((reason: TagRejectReason) => {
    if (reason === "limit") {
      toast.error("标签最多 20 个");
    } else if (reason === "duplicate") {
      toast.error("标签已存在");
    }
  }, [toast]);
  const tagManager = useTagManager(initialValues.tags, handleTagReject, (removed) => {
    // Backspace 快速删除最后一个标签时给反馈，避免误触无感知
    toast.info(`已移除标签 ${removed}`);
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const authExpired = useAuthExpired();

  // slugError 出现时把焦点移到 slug 输入框，用户可以直接改
  useEffect(() => {
    if (slugError) {
      document.getElementById(`${idPrefix}-slug`)?.focus();
    }
  }, [slugError, idPrefix]);

  // 恢复草稿时把输入框里未确认的标签内容也还原
  useEffect(() => {
    if (initialTagInput) tagManager.setInput(initialTagInput);
    // 仅挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 表单或标签状态变化时通知父级（跳过首次挂载），父级据此做草稿自动保存
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onValuesChange?.({ ...form, tags: tagManager.tags, tagInput: tagManager.input });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, tagManager.tags, tagManager.input]);

  const updateField = (patch: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    onDirty();
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => {
      const next = { ...prev, title };
      if (slugEditable) {
        // slug 未被手动改过（为空或仍等于上一个标题的 slugify 结果）时跟随标题
        const following = prev.slug === "" || slugify(prev.title) === prev.slug;
        if (following) {
          let slug = slugify(title);
          // 纯中文等标题 slugify 后为空，回退为时间戳 slug，保证一键得到合法 slug
          if (!slug && title.trim()) slug = `post-${Date.now().toString(36)}`;
          next.slug = slug;
        }
      }
      return next;
    });
    onDirty();
  };

  const handleSlugChange = (slug: string) => {
    updateField({ slug: slug.toLowerCase().replace(/\s+/g, "-") });
    onSlugChange?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || uploading) return;

    // 提交前把标签输入框里未确认的内容补进 tags，避免静默丢失
    let tags = tagManager.tags;
    const pendingTag = tagManager.input.trim();
    if (pendingTag && !tags.includes(pendingTag)) {
      if (tags.length >= 20) {
        // 达上限时不丢弃输入框内容：中止提交并提示
        toast.error("标签最多 20 个，请先删除部分标签");
        return;
      }
      tags = [...tags, pendingTag];
      tagManager.setTags(tags);
      tagManager.setInput("");
    }

    setSaving(true);
    onSavingChange?.(true);
    try {
      const ok = await onSubmit({ ...form, tags });
      if (ok) tagManager.setInput("");
    } finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  };

  const slugValid = !form.slug || VALID_SLUG_RE.test(form.slug);

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
        // Ctrl/Cmd+S 快捷保存
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          e.currentTarget.requestSubmit();
          return;
        }
        // 防止在输入框里按 Enter 误提交整个表单（标签输入框有自己的 Enter 处理）
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
          e.preventDefault();
        }
      }}
    >
      <fieldset disabled={saving} className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-title`} className="text-sm font-medium text-foreground">
          标题 <span className="text-xs text-muted">({form.title.length}/500)</span>
        </label>
        <input
          id={`${idPrefix}-title`}
          type="text"
          required
          maxLength={500}
          autoFocus={autoFocusTitle}
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="文章标题"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-slug`} className="text-sm font-medium text-foreground">
          {slugEditable ? (
            <>
              Slug（URL 标识）
              {form.slug && (
                <span className={slugValid ? "ml-1 text-green-700" : "ml-1 text-red-700"}>
                  {slugValid ? "✓" : "只能包含小写字母、数字和连字符"}
                </span>
              )}
            </>
          ) : (
            "Slug"
          )}
        </label>
        {slugEditable ? (
          <>
            <input
              id={`${idPrefix}-slug`}
              type="text"
              required
              maxLength={255}
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="hello-world"
              pattern="^[a-z0-9\-]+$"
              aria-invalid={!!slugError || (!!form.slug && !slugValid)}
              aria-describedby={slugError ? `${idPrefix}-slug-error` : undefined}
              className={`${fieldClass} font-mono ${
                slugError || (form.slug && !slugValid) ? "border-red-400" : ""
              }`}
            />
            {slugError && (
              <p id={`${idPrefix}-slug-error`} className="text-xs text-red-700">{slugError}</p>
            )}
          </>
        ) : (
          <input
            id={`${idPrefix}-slug`}
            type="text"
            disabled
            value={form.slug}
            className={`${fieldBase} cursor-not-allowed px-3 py-2 font-mono opacity-60`}
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-date`} className="text-sm font-medium text-foreground">日期</label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            required
            value={form.date}
            onChange={(e) => updateField({ date: e.target.value })}
            className={`${fieldClass} tabular-nums`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-status`} className="text-sm font-medium text-foreground">发布状态</label>
          <select
            id={`${idPrefix}-status`}
            value={form.published ? "published" : form.archivedAt ? "archived" : "draft"}
            onChange={(e) => {
              const status = e.target.value;
              if (status === "published") updateField({ published: true, archivedAt: null });
              else if (status === "archived") updateField({ published: false, archivedAt: new Date().toISOString() });
              else updateField({ published: false, archivedAt: null });
            }}
            className={fieldClass}
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-tags`} className="text-sm font-medium text-foreground">
          标签 <span className="text-xs text-muted">({tagManager.tags.length}/20)</span>
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
                onClick={() => { tagManager.removeTag(tag); onDirty(); }}
                aria-label={`移除标签 ${tag}`}
                className="flex min-h-[32px] min-w-[32px] items-center justify-center transition-colors hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            id={`${idPrefix}-tags`}
            type="text"
            maxLength={50}
            value={tagManager.input}
            onChange={(e) => { tagManager.setInput(e.target.value); onDirty(); }}
            onKeyDown={(e) => { const wasAdded = tagManager.handleInputKeyDown(e); if (wasAdded) onDirty(); }}
            placeholder="输入标签后按回车添加"
            className={`${fieldClass} flex-1`}
          />
          <Button
            type="button"
            disabled={!tagManager.input.trim()}
            onClick={() => { if (tagManager.addTag(tagManager.input)) onDirty(); }}
            className="shrink-0"
          >
            添加
          </Button>
        </div>
      </div>

      <details className="rounded-lg border border-border/50 p-4">
        <summary className="cursor-pointer text-sm font-medium text-foreground">摘要、SEO 与分享设置</summary>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-excerpt`} className="text-sm font-medium">文章摘要</label>
            <textarea id={`${idPrefix}-excerpt`} rows={3} maxLength={2000} value={form.excerpt ?? ""} onChange={(e) => updateField({ excerpt: e.target.value || null })} placeholder="留空时从正文自动提取" className={fieldClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor={`${idPrefix}-seo-title`} className="text-sm font-medium">SEO 标题</label>
              <input id={`${idPrefix}-seo-title`} maxLength={500} value={form.seoTitle ?? ""} onChange={(e) => updateField({ seoTitle: e.target.value || null })} placeholder="留空时使用文章标题" className={fieldClass} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={`${idPrefix}-cover`} className="text-sm font-medium">封面 / 分享图 URL</label>
              <input id={`${idPrefix}-cover`} type="url" maxLength={2000} value={form.coverImage ?? ""} onChange={(e) => updateField({ coverImage: e.target.value || null })} placeholder="留空时使用正文第一张图片" className={fieldClass} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-seo-description`} className="text-sm font-medium">SEO / 分享描述</label>
            <textarea id={`${idPrefix}-seo-description`} rows={2} maxLength={1000} value={form.seoDescription ?? ""} onChange={(e) => updateField({ seoDescription: e.target.value || null })} placeholder="留空时使用文章摘要" className={fieldClass} />
          </div>
          <div className="rounded-lg border border-border/50 p-3">
            <p className="text-xs text-muted">分享卡片预览</p>
            <p className="mt-2 break-words text-sm font-semibold">{form.seoTitle || form.title || "文章标题"}</p>
            <p className="mt-1 break-words text-xs text-muted">{form.seoDescription || form.excerpt || "将使用正文自动摘要"}</p>
            <p className="mt-2 truncate text-xs text-muted">{form.coverImage || "使用正文首图或站点默认分享图"}</p>
          </div>
        </div>
      </details>

      <ContentChecks values={{ ...form, tags: tagManager.tags }} />

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-content`} className="text-sm font-medium text-foreground">正文（Markdown）</label>
        <MarkdownEditor
          id={`${idPrefix}-content`}
          value={form.content}
          onChange={(v) => updateField({ content: v })}
          rows={contentRows}
          required
          onAuthExpired={authExpired}
          onUploadingChange={setUploading}
        />
      </div>

      {/* sticky 底部操作栏：长表单下保存/取消始终可达；实底 + 顶部分隔线 + 右对齐（对话框页脚惯例）。
          弹窗里通过 footerClassName 出血撑满弹窗边缘并贴齐下缘，避免"上下悬空一条带子"的观感 */}
      <div className={`sticky bottom-0 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-background border-t border-border/50 flex items-center justify-end gap-2 ${footerClassName ?? ""}`}>
        {onCancel && (
          <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={saving || uploading || (slugEditable && !!form.slug && !slugValid)}
          title="保存 (Ctrl+S)"
          className="px-6"
        >
          <Save className="w-4 h-4" />
          {saving ? "保存中..." : uploading ? "上传中..." : "保存"}
        </Button>
      </div>
      </fieldset>
    </form>
  );
}
