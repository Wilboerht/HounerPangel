"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";

interface LabelsToolbarProps {
  items: { id: number; name: string }[];
}

export function LabelsToolbar({ items }: LabelsToolbarProps) {
  const router = useRouter();
  const toast = useToast();
  const [revoking, setRevoking] = useState<number | null>(null);

  const revoke = async (id: number) => {
    if (revoking !== null) return;
    setRevoking(id);
    try {
      const res = await fetch(`/api/medicine/items/${id}/qr`, { method: "DELETE" });
      if (res.ok) {
        toast.success("二维码已撤销，旧标签扫码将提示失效");
        router.refresh();
      } else {
        toast.error("撤销失败");
      }
    } catch {
      toast.error("撤销失败");
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 print:hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">标签打印</h1>
          <p className="text-sm text-muted mt-1">
            共 {items.length} 张（60mm × 40mm）。打印时选择标签纸尺寸、边距设为「无」、缩放 100%。
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Printer className="w-4 h-4" />
          打印
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        {items.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-1">
            {item.name}
            <button
              type="button"
              onClick={() => revoke(item.id)}
              disabled={revoking === item.id}
              aria-label={`撤销「${item.name}」的二维码`}
              className="inline-flex items-center gap-0.5 text-muted hover:text-red-500 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              撤销二维码
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
