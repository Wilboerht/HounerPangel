import { useState } from "react";

export function useTagManager(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");

  const addTag = (inputVal: string) => {
    const trimmed = inputVal.trim();
    if (trimmed && tags.length < 20) {
      setTags((prev) => {
        if (prev.includes(trimmed)) return prev;
        return [...prev, trimmed];
      });
      setInput("");
      return true;
    }
    return false;
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return { tags, setTags, input, setInput, addTag, removeTag, handleInputKeyDown };
}
