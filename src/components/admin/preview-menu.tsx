"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Eye } from "lucide-react";

interface PreviewMenuProps {
  savedHref: string;
  disabled?: boolean;
  onPreviewChanges: () => void;
}

const itemCls =
  "flex w-full items-start gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-foreground/5 focus:bg-foreground/5 focus:outline-none";

export function PreviewMenu({ savedHref, disabled = false, onPreviewChanges }: PreviewMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (items.length === 0) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else if (event.key === "ArrowDown") next = current < 0 ? 0 : (current + 1) % items.length;
    else next = current <= 0 ? items.length - 1 : current - 1;
    items[next].focus();
  };

  const selectChanges = () => {
    setOpen(false);
    triggerRef.current?.focus();
    onPreviewChanges();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg border border-border/50 px-3 py-1.5 text-sm text-muted transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"
      >
        <Eye className="h-4 w-4" />
        预览
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="预览选项"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-20 mt-1 w-60 rounded-lg border border-border/50 bg-background p-1 shadow-lg"
        >
          <button type="button" role="menuitem" onClick={selectChanges} className={itemCls}>
            <Eye className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium">预览当前更改</span>
              <span className="text-xs text-muted">包含尚未保存的内容</span>
            </span>
          </button>
          <a
            href={savedHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            className={itemCls}
          >
            <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium">预览已保存版本</span>
              <span className="text-xs text-muted">在新标签页打开</span>
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
