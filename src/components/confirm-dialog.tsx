"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  const trapRef = useFocusTrap(isOpen, onClose);
  const [pending, setPending] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={safeAnimate(reduce, { opacity: 0 })}
            animate={{ opacity: 1 }}
            exit={safeAnimate(reduce, { opacity: 0 })}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
            transition={springModal}
            className="fixed inset-0 flex items-center justify-center z-[111] p-6"
          >
            <div
              ref={trapRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby="confirm-message"
              className="relative w-full max-w-sm bg-background rounded-2xl border border-border/50 shadow-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full flex-shrink-0 ${danger ? "bg-red-500/10" : "bg-foreground/5"}`}>
                  <AlertTriangle className={`w-5 h-5 ${danger ? "text-red-500" : "text-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id="confirm-title" className="text-base font-semibold text-foreground mb-1">
                    {title}
                  </h3>
                  <p id="confirm-message" className="text-sm text-muted leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
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
                      onClose();
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    danger
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
