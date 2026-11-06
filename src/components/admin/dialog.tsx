"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { IconButton } from "@/components/admin/icon-button";

type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl";

const sizeCls: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  "2xl": "max-w-4xl",
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  size?: DialogSize;
  // 移动端铺满全屏（长表单/选择器）
  fullscreenOnMobile?: boolean;
  hideClose?: boolean;
  closeDisabled?: boolean;
  closeLabel?: string;
  // 基准层级；遮罩使用 zIndex，面板使用 zIndex + 1
  zIndex?: number;
  // false 时由内容自己管理滚动（如媒体选择器的固定筛选栏 + 可滚动网格）
  bodyScroll?: boolean;
  bodyClassName?: string;
  panelClassName?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  headerExtra,
  footer,
  children,
  size = "md",
  fullscreenOnMobile = false,
  hideClose = false,
  closeDisabled = false,
  closeLabel = "关闭弹窗",
  zIndex = 100,
  bodyScroll = true,
  bodyClassName,
  panelClassName,
}: DialogProps) {
  const reduce = useSafeMotion();
  const trapRef = useFocusTrap(open, onClose);
  useScrollLock(open);
  const titleId = useId();
  const descriptionId = useId();

  const panel = [
    "relative flex max-h-full w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xl",
    sizeCls[size],
    fullscreenOnMobile
      ? "max-sm:h-dvh max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:pt-[env(safe-area-inset-top,0px)] max-sm:pl-[env(safe-area-inset-left,0px)] max-sm:pr-[env(safe-area-inset-right,0px)]"
      : "",
    panelClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = [
    "min-h-0 flex-1 [overscroll-behavior:contain]",
    bodyScroll ? "overflow-y-auto" : "overflow-hidden",
    "px-4 sm:px-5",
    bodyClassName ?? "py-4",
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperPadding = fullscreenOnMobile
    ? "p-0 sm:p-6"
    : "p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] sm:p-6";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={safeAnimate(reduce, { opacity: 0 })}
            animate={{ opacity: 1 }}
            exit={safeAnimate(reduce, { opacity: 0 })}
            onClick={onClose}
            style={{ zIndex }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm print:hidden"
          />
          <motion.div
            initial={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
            transition={springModal}
            onClick={onClose}
            style={{ zIndex: zIndex + 1 }}
            className={`fixed inset-0 flex items-center justify-center print:hidden ${wrapperPadding}`}
          >
            <div
              ref={trapRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              onClick={(event) => event.stopPropagation()}
              className={panel}
            >
              <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <h2
                    id={titleId}
                    className="text-lg font-semibold tracking-tight text-foreground"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p id={descriptionId} className="mt-1 text-sm text-muted">
                      {description}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {headerExtra}
                  {!hideClose && (
                    <IconButton
                      label={closeLabel}
                      onClick={onClose}
                      size="adaptive"
                      disabled={closeDisabled}
                    >
                      <X className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
              </div>

              <div className={body}>{children}</div>

              {footer && (
                <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border/50 px-4 py-3 sm:px-5">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
