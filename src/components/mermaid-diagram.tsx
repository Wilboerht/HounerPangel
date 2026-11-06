"use client";

import { useEffect, useId, useState } from "react";

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

export function MermaidDiagram({ chart }: { chart: string }) {
  const [result, setResult] = useState<{ chart: string; svg: string; error: string } | null>(null);
  const diagramId = `mermaid-${useId().replace(/:/g, "")}`;
  const current = result?.chart === chart ? result : null;

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

  return (
    <figure className="overflow-x-auto rounded-xl border border-border/50 bg-background p-3 sm:p-4">
      {current?.svg ? (
        <div
          aria-label="Mermaid 图表"
          className="min-w-fit [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: current.svg }}
        />
      ) : current?.error ? (
        <div role="alert">
          <p className="text-sm text-red-500">Mermaid 图表渲染失败，请检查语法。</p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-muted"><code>{chart}</code></pre>
        </div>
      ) : (
        <p role="status" className="text-sm text-muted">正在加载图表…</p>
      )}
    </figure>
  );
}
