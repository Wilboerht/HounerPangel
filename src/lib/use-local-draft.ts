import { useCallback, useEffect, useRef } from "react";

// 把表单内容防抖写入 localStorage，避免刷新/误关导致未保存内容丢失
export function useLocalDraft<T>(key: string, delay = 2000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const scheduleSave = useCallback((value: T) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // 存储满或隐私模式下静默失败，草稿只是锦上添花
      }
    }, delay);
  }, [key, delay]);

  const read = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      localStorage.removeItem(key);
    } catch {}
  }, [key]);

  return { scheduleSave, read, clear };
}
