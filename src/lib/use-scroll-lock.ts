import { useEffect } from "react";

// 多个弹层可同时打开（如新建弹窗上叠确认框），用计数器保证最后一层关闭时才恢复滚动
let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";
let previousOverscroll = "";

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    if (lockCount === 0) {
      const { style } = document.body;
      previousOverflow = style.overflow;
      previousPaddingRight = style.paddingRight;
      previousOverscroll = style.overscrollBehavior;
      // 补偿消失的滚动条宽度，避免背景内容横向跳动
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      style.overflow = "hidden";
      style.overscrollBehavior = "none";
      if (scrollbarWidth > 0) {
        style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        const { style } = document.body;
        style.overflow = previousOverflow;
        style.paddingRight = previousPaddingRight;
        style.overscrollBehavior = previousOverscroll;
      }
    };
  }, [locked]);
}
