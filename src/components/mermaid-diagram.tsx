"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import { useFocusTrap } from "@/lib/focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";

type Mermaid = typeof import("mermaid").default;

let mermaidLoader: Promise<Mermaid> | null = null;
let renderQueue: Promise<void> = Promise.resolve();

function loadMermaid() {
  mermaidLoader ??= import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: "neutral",
    });
    return mermaid;
  });
  return mermaidLoader;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export function MermaidDiagram({ chart }: { chart: string }) {
  const [result, setResult] = useState<{ chart: string; svg: string; error: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const diagramId = `mermaid-${useId().replace(/:/g, "")}`;
  const current = result?.chart === chart ? result : null;
  const trapRef = useFocusTrap(previewOpen, () => setPreviewOpen(false));
  useScrollLock(previewOpen);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const mermaid = await loadMermaid();
      if (cancelled) return;
      await mermaid.parse(chart);
      if (cancelled) return;
      const rendered = await mermaid.render(diagramId, chart);
      if (!cancelled) setResult({ chart, svg: rendered.svg, error: "" });
    };

    const pending = renderQueue.then(render);
    renderQueue = pending.catch(() => {});
    pending.catch((cause: unknown) => {
      if (cancelled) return;
      setResult({ chart, svg: "", error: cause instanceof Error ? cause.message : "图表渲染失败" });
    });

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId]);

  const openPreview = () => {
    setZoom(1);
    setPreviewOpen(true);
  };

  const zoomOut = () => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));
  const zoomIn = () => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));

  return (
    <figure className="overflow-x-auto rounded-xl border border-border/50 bg-background p-3 sm:p-4">
      {current?.svg ? (
        <button
          type="button"
          onClick={openPreview}
          aria-label="放大 Mermaid 图表"
          title="点击放大图表"
          className="group relative block w-full cursor-zoom-in rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <div
            aria-hidden="true"
            className="min-w-fit [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: current.svg }}
          />
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-border/50 bg-background/90 px-2 py-1 text-xs text-muted opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Maximize2 className="h-3.5 w-3.5" />
            放大预览
          </span>
        </button>
      ) : current?.error ? (
        <div role="alert">
          <p className="text-sm text-red-500">Mermaid 图表渲染失败，请检查语法。</p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-muted"><code>{chart}</code></pre>
        </div>
      ) : (
        <p role="status" className="text-sm text-muted">正在加载图表…</p>
      )}
      {previewOpen && current?.svg && createPortal(
        <div
          className="fixed inset-0 z-[130] bg-black/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mermaid 图表放大预览"
            className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-xl border border-border/50 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border/50 px-3 py-2 sm:px-4">
              <h2 className="text-sm font-semibold text-foreground">图表预览</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  aria-label="缩小图表"
                  title="缩小"
                  className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  aria-label="重置图表缩放"
                  title="重置为 100%"
                  className="min-h-11 min-w-16 rounded-md px-2 text-xs font-medium tabular-nums text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  aria-label="放大图表"
                  title="放大"
                  className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  aria-label="关闭图表预览"
                  title="关闭 (Escape)"
                  className="ml-1 flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto overscroll-contain bg-foreground/[0.03] p-4">
              <div className="flex min-h-full min-w-full items-center justify-center">
                <div
                  aria-label="Mermaid 图表"
                  className="shrink-0 rounded-lg bg-background p-4 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-none"
                  style={{ width: `${zoom * 100}%` }}
                  dangerouslySetInnerHTML={{ __html: current.svg }}
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </figure>
  );
}
