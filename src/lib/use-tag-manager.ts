import { useState, useCallback, useMemo } from "react";

export type TagRejectReason = "limit" | "duplicate";

export function useTagManager(
  initialTags: string[] = [],
  onReject?: (reason: TagRejectReason) => void,
  // Backspace 快速删除（输入框为空时按退格删掉最后一个标签）时回调，供调用方给出反馈
  onRemove?: (tag: string) => void
) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");

  const addTag = useCallback((inputVal: string) => {
    const trimmed = inputVal.trim();
    if (!trimmed) return false;
    if (tags.length >= 20) {
      onReject?.("limit");
      return false;
    }
    if (tags.includes(trimmed)) {
      onReject?.("duplicate");
      return false;
    }
    setTags((prev) => {
      if (prev.length >= 20 || prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
    setInput("");
    return true;
  }, [tags, onReject]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      return addTag(input);
    }
    if (e.key === "Backspace" && !input) {
      if (tags.length > 0) {
        onRemove?.(tags[tags.length - 1]);
        setTags((prev) => prev.slice(0, -1));
        return true;
      }
    }
    return false;
  }, [input, tags, addTag, onRemove]);

  return useMemo(() => ({ tags, setTags, input, setInput, addTag, removeTag, handleInputKeyDown }), [tags, input, addTag, removeTag, handleInputKeyDown]);
}
