"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useId, useState } from "react";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";

interface ConfirmDialogProps {
  isOpen: boolean;
  // 取消/点遮罩/Escape 时调用；确认处理期间会忽略关闭操作
  onClose: () => void;
  // 确认时调用；不会自动关弹窗，由调用方在 onConfirm 里把 isOpen 置为 false
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "确认删除",
  danger = true,
}: ConfirmDialogProps) {
  const reduce = useSafeMotion();
  const [pending, setPending] = useState(false);
  const handleClose = () => {
    if (!pending) onClose();
  };
  const trapRef = useFocusTrap(isOpen, handleClose);
  useScrollLock(isOpen);
  const titleId = useId();
  const messageId = useId();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={safeAnimate(reduce, { opacity: 0 })}
            animate={{ opacity: 1 }}
            exit={safeAnimate(reduce, { opacity: 0 })}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
            transition={springModal}
            className="fixed inset-0 flex items-center justify-center z-[111] p-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pl-[calc(1.5rem+env(safe-area-inset-left,0px))] pr-[calc(1.5rem+env(safe-area-inset-right,0px))]"
          >
            <div
              ref={trapRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={messageId}
              className="relative w-full max-w-sm max-h-full overflow-y-auto bg-background rounded-2xl border border-border/50 shadow-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full flex-shrink-0 ${danger ? "bg-red-500/10" : "bg-foreground/5"}`}>
                  <AlertTriangle className={`w-5 h-5 ${danger ? "text-red-500" : "text-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id={titleId} className="text-base font-semibold text-foreground mb-1">
                    {title}
                  </h3>
                  <p id={messageId} className="text-sm text-muted leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleClose}
                  className="px-4 py-2 min-h-[44px] rounded-lg text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-60"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={async () => {
                    if (pending) return;
                    setPending(true);
                    try {
                      await onConfirm();
                    } catch {
                      // onConfirm handles its own errors
                    } finally {
                      setPending(false);
                    }
                  }}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                    danger
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {pending ? "处理中..." : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
