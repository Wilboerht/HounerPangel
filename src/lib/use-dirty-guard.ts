import { useEffect, useRef } from "react";

const GUARD_KEY = "__dirtyGuard";

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
    // 占位条目带唯一 token：解除守卫（保存成功/确认离开/卸载）时，
    // 只有占位仍是当前条目才 back 清掉它；popstate 已消费占位或页面已跳转时
    // 当前条目不是我们的，再 back 会误退到上一页
    const token = Math.random().toString(36).slice(2);
    const push = () => history.pushState({ [GUARD_KEY]: token }, "", window.location.href);
    const isOwnEntry = () =>
      (history.state as Record<string, unknown> | null)?.[GUARD_KEY] === token;
    push();
    const onPopState = () => {
      // popstate 已消费掉旧占位，重新占位留在当前页，把去留交给确认对话框
      push();
      onAttemptLeaveRef.current();
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (isOwnEntry()) history.back();
    };
  }, [dirty]);
}
