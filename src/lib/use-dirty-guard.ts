import { useEffect, useRef } from "react";

// 有未保存内容时的离开守卫：浏览器关闭/刷新用 beforeunload，
// SPA 内的前进/后退用 popstate + pushState 占位拦截，把去留交给调用方的确认对话框
export function useDirtyGuard(dirty: boolean, onAttemptLeave: () => void) {
  const onAttemptLeaveRef = useRef(onAttemptLeave);
  useEffect(() => {
    onAttemptLeaveRef.current = onAttemptLeave;
  }, [onAttemptLeave]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    history.pushState(null, "", window.location.href);
    const onPopState = () => {
      // 重新占位留在当前页，把去留交给确认对话框
      history.pushState(null, "", window.location.href);
      onAttemptLeaveRef.current();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [dirty]);
}
