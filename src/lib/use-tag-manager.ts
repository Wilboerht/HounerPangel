import { useState, useCallback, useMemo } from "react";

export function useTagManager(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");

  const addTag = useCallback((inputVal: string) => {
    const trimmed = inputVal.trim();
    if (!trimmed) return false;
    let wasAdded = false;
    setTags((prev) => {
      if (prev.length >= 20 || prev.includes(trimmed)) return prev;
      wasAdded = true;
      return [...prev, trimmed];
    });
    if (wasAdded) setInput("");
    return wasAdded;
  }, []);

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
        setTags((prev) => prev.slice(0, -1));
        return true;
      }
    }
    return false;
  }, [input, tags, addTag]);

  return useMemo(() => ({ tags, setTags, input, setInput, addTag, removeTag, handleInputKeyDown }), [tags, input, addTag, removeTag, handleInputKeyDown]);
}
