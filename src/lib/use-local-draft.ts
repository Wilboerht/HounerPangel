import { useCallback, useEffect, useRef } from "react";

// 把表单内容防抖写入 localStorage，避免刷新/误关导致未保存内容丢失
export function useLocalDraft<T>(key: string, delay = 2000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<T | null>(null);

  // 立即写入还在防抖窗口里的数据；卸载/页面隐藏时兜底调用，避免最后几秒的输入丢失
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingRef.current === null) return;
    try {
      localStorage.setItem(key, JSON.stringify(pendingRef.current));
    } catch {
      // 存储满或隐私模式下静默失败，草稿只是锦上添花
    }
    pendingRef.current = null;
  }, [key]);

  const scheduleSave = useCallback((value: T) => {
    pendingRef.current = value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, delay);
  }, [flush, delay]);

  // 关标签页/刷新走 pagehide，组件卸载走 cleanup，两条路径都兜底 flush
  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  const read = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    pendingRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      localStorage.removeItem(key);
    } catch {}
  }, [key]);

  return { scheduleSave, read, clear };
}
