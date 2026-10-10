"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import { MarkdownEditor } from "@/components/markdown-editor";
import { useTagManager, type TagRejectReason } from "@/lib/use-tag-manager";
import { useToast } from "@/components/toast";

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
}: PostFormProps) {
  const [form, setForm] = useState({
    slug: initialValues.slug,
    title: initialValues.title,
    date: initialValues.date,
    published: initialValues.published,
    content: initialValues.content,
  });
  const toast = useToast();
  // 达上限/重复被拒绝时给出提示，避免输入框里的内容被静默忽略
  const handleTagReject = useCallback((reason: TagRejectReason) => {
    if (reason === "limit") toast.error("标签最多 20 个");
  }, [toast]);
  const tagManager = useTagManager(initialValues.tags, handleTagReject);
  const [saving, setSaving] = useState(false);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

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
    try {
      const ok = await onSubmit({ ...form, tags });
      if (ok) tagManager.setInput("");
    } finally {
      setSaving(false);
    }
  };

  const slugValid = !form.slug || VALID_SLUG_RE.test(form.slug);

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
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
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-title`} className="text-sm font-medium text-foreground">
          标题 <span className="text-muted">({form.title.length}/500)</span>
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
          className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-slug`} className="text-sm font-medium text-foreground">
          {slugEditable ? (
            <>
              Slug（URL 标识）
              {form.slug && (
                <span className={slugValid ? "text-green-500 ml-1" : "text-red-500 ml-1"}>
                  {slugValid ? "✓" : "只能包含小写字母、数字和连字符"}
                </span>
              )}
            </>
          ) : (
            "Slug"
          )}
        </label>
        {slugEditable ? (
          <input
            id={`${idPrefix}-slug`}
            type="text"
            required
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="hello-world"
            pattern="^[a-z0-9\-]+$"
            className={`px-4 py-2 rounded-lg bg-foreground/5 border text-foreground placeholder:text-muted/50 focus:outline-none transition-colors ${
              form.slug && !slugValid
                ? "border-red-300 focus:border-red-400"
                : "border-border/50 focus:border-accent/50"
            }`}
          />
        ) : (
          <input
            id={`${idPrefix}-slug`}
            type="text"
            disabled
            value={form.slug}
            className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-muted cursor-not-allowed"
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-date`} className="text-sm font-medium text-foreground">日期</label>
        <input
          id={`${idPrefix}-date`}
          type="date"
          required
          value={form.date}
          onChange={(e) => updateField({ date: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor={`${idPrefix}-published`} className="text-sm font-medium text-foreground">发布状态</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id={`${idPrefix}-published`}
            type="checkbox"
            checked={form.published}
            onChange={(e) => updateField({ published: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-foreground/15 rounded-full peer-checked:bg-accent peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
        </label>
        <span className="text-xs text-muted">{form.published ? "已发布" : "草稿"}</span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-tags`} className="text-sm font-medium text-foreground">
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
                onClick={() => { tagManager.removeTag(tag); onDirty(); }}
                className="hover:text-red-500 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
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
            value={tagManager.input}
            onChange={(e) => tagManager.setInput(e.target.value)}
            onKeyDown={(e) => { const wasAdded = tagManager.handleInputKeyDown(e); if (wasAdded) onDirty(); }}
            placeholder="输入标签后按回车添加"
            className="flex-1 px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => { if (tagManager.addTag(tagManager.input)) onDirty(); }}
            disabled={!tagManager.input.trim()}
            className="px-4 py-2 rounded-lg bg-foreground/5 text-muted hover:text-foreground disabled:opacity-30 transition-colors text-sm"
          >
            添加
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-content`} className="text-sm font-medium text-foreground">正文（Markdown）</label>
        <MarkdownEditor
          id={`${idPrefix}-content`}
          value={form.content}
          onChange={(v) => updateField({ content: v })}
          rows={contentRows}
        />
      </div>

      {/* sticky 底部操作栏：长表单下保存/取消始终可达；含底部安全区避让 */}
      <div className="sticky bottom-0 -mx-4 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-background/85 backdrop-blur-sm flex items-center gap-4">
        <button
          type="submit"
          disabled={saving || (slugEditable && !!form.slug && !slugValid)}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "保存中..." : "保存"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}
