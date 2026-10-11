"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, MapPin, Plus, QrCode, RotateCcw, Search, Tag, Trash2, X } from "lucide-react";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { IconButton } from "@/components/admin/icon-button";
import { MedForm, blankMedValues, medValuesFromItem, type MedFormValues } from "@/components/admin/medicine-form";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { expiryDistanceText } from "@/lib/medicine";
import type { ExpiryStatus, MedItemWithStatus, MedLocation } from "@/lib/types/medicine";

type StatusFilter = "all" | ExpiryStatus;

const STATUS_META: Record<ExpiryStatus, { label: string; variant: "danger" | "warning" | "neutral" }> = {
  expired: { label: "已过期", variant: "danger" },
  expiring: { label: "临期", variant: "warning" },
  ok: { label: "正常", variant: "neutral" },
};

// 表单空串转 null，与 API schema 的 nullable 对应
function toPayload(form: MedFormValues) {
  const orNull = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    name: form.name.trim(),
    tradeName: orNull(form.tradeName),
    spec: orNull(form.spec),
    dosageForm: form.dosageForm || null,
    category: form.category || null,
    quantity: orNull(form.quantity),
    locationId: form.locationId,
    expiry: form.expiry,
    openedAt: form.openedAt || null,
    afterOpeningExpiry: form.afterOpeningExpiry || null,
    usageText: orNull(form.usageText),
    note: orNull(form.note),
  };
}

export function MedicineAdminClient() {
  const toast = useToast();
  const reduce = useSafeMotion();
  const authExpired = useAuthExpired();
  const router = useRouter();

  const [items, setItems] = useState<MedItemWithStatus[]>([]);
  const [locations, setLocations] = useState<MedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [trashView, setTrashView] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; item: MedItemWithStatus } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedItemWithStatus | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<MedItemWithStatus | null>(null);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const trapRef = useFocusTrap(modal !== null, () => setModal(null));
  useScrollLock(modal !== null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const [itemsRes, locationsRes] = await Promise.all([
          fetch(`/api/medicine/items${trashView ? "?trash=1" : ""}`, { signal }),
          fetch("/api/medicine/locations", { signal }),
        ]);
        if (itemsRes.status === 401 || locationsRes.status === 401) {
          authExpired();
          return;
        }
        if (!itemsRes.ok || !locationsRes.ok) throw new Error("load failed");
        const [itemsData, locationsData] = await Promise.all([itemsRes.json(), locationsRes.json()]);
        setItems(itemsData);
        setLocations(locationsData);
        setLoadFailed(false);
        setLoading(false);
      } catch {
        if (signal?.aborted) return;
        toast.error("加载药品列表失败，请刷新重试");
        setLoadFailed(true);
        setLoading(false);
      }
    },
    [trashView, toast, authExpired]
  );

  // 表单内新建位置后刷新位置列表（不碰 items，避免打断录入）
  const reloadLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/medicine/locations");
      if (res.ok) setLocations(await res.json());
    } catch {
      // 刷新失败不影响表单：新位置已通过表单的本地合并立即可选
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const stats = {
    expired: items.filter((i) => i.expiryStatus === "expired").length,
    expiring: items.filter((i) => i.expiryStatus === "expiring").length,
    total: items.length,
  };

  const filtered = items.filter((item) => {
    if (statusFilter !== "all" && item.expiryStatus !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.tradeName ?? "").toLowerCase().includes(q) ||
      item.locationName.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (form: MedFormValues): Promise<boolean> => {
    const isEdit = modal?.mode === "edit";
    const url = isEdit ? `/api/medicine/items/${modal.item.id}` : "/api/medicine/items";
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });
      if (res.status === 401) {
        authExpired();
        return false;
      }
      if (res.ok) {
        setModal(null);
        load();
        toast.success(isEdit ? "药品已更新" : "药品已添加");
        return true;
      }
      const data = await res.json();
      toast.error(data.error || "保存失败");
      return false;
    } catch {
      toast.error("保存失败");
      return false;
    }
  };

  const handleSoftDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/medicine/items/${deleteTarget.id}`, { method: "DELETE" });
      if (res.status === 401) {
        setDeleteTarget(null);
        authExpired();
        return;
      }
      if (res.ok) {
        toast.success("已移入回收站");
        load();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败");
    }
    setDeleteTarget(null);
  };

  const handleRestore = async (item: MedItemWithStatus) => {
    try {
      const res = await fetch(`/api/medicine/items/${item.id}/restore`, { method: "POST" });
      if (res.status === 401) {
        authExpired();
        return;
      }
      if (res.ok) {
        toast.success("已恢复");
        load();
      } else {
        toast.error("恢复失败");
      }
    } catch {
      toast.error("恢复失败");
    }
  };

  const handlePurge = async () => {
    if (!purgeTarget) return;
    try {
      const res = await fetch(`/api/medicine/items/${purgeTarget.id}/purge`, { method: "DELETE" });
      if (res.status === 401) {
        setPurgeTarget(null);
        authExpired();
        return;
      }
      if (res.ok) {
        toast.success("已彻底删除");
        load();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败");
    }
    setPurgeTarget(null);
  };

  const statCards: { key: StatusFilter; label: string; value: number; cls: string }[] = [
    { key: "expired", label: "已过期", value: stats.expired, cls: "text-red-500" },
    { key: "expiring", label: "30 天内到期", value: stats.expiring, cls: "text-amber-600" },
    { key: "all", label: "药品总数", value: stats.total, cls: "text-foreground" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={trashView ? "回收站" : "药品记录"}
        description={trashView ? "删除的药品保留 30 天，可恢复" : "药品、位置与效期一览"}
        actions={
          <div className="flex items-center gap-2">
            {trashView ? (
              <button
                onClick={() => {
                  setTrashView(false);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border/50 text-sm text-foreground hover:bg-foreground/[0.03] transition-colors"
              >
                返回列表
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectMode(!selectMode);
                    setSelectedIds(new Set());
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition-colors ${
                    selectMode
                      ? "border-accent/50 text-accent"
                      : "border-border/50 text-muted hover:text-foreground hover:bg-foreground/[0.03]"
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  贴标
                </button>
                <Link
                  href="/admin/medicine/locations"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  位置管理
                </Link>
                <a
                  href="/api/medicine/export.csv"
                  download
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  导出 CSV
                </a>
                <button
                  onClick={() => {
                    setTrashView(true);
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  回收站
                </button>
                <button
                  onClick={() => setModal({ mode: "create" })}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新增药品
                </button>
              </>
            )}
          </div>
        }
      />

      {!trashView && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {statCards.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatusFilter(statusFilter === s.key && s.key !== "all" ? "all" : s.key)}
              className={`rounded-xl border px-4 py-3 sm:px-5 sm:py-4 text-left transition-colors ${
                statusFilter === s.key && s.key !== "all"
                  ? "border-accent/50 bg-foreground/[0.03]"
                  : "border-border/50 hover:bg-foreground/[0.02]"
              }`}
            >
              <p className="text-xs text-muted sm:text-sm">{s.label}</p>
              <p className={`mt-1 text-2xl font-semibold tabular-nums ${s.cls}`}>{s.value}</p>
            </button>
          ))}
        </div>
      )}

      {loadFailed && !loading && (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          数据加载失败，请刷新重试
        </p>
      )}

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="加载中">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[62px] rounded-lg border border-border/50 bg-foreground/[0.03] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {!trashView && items.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="search"
                placeholder="搜索药品名称、商品名或位置..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="清除搜索"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filtered.map((item) => {
                const distanceText = expiryDistanceText(item.effectiveExpiry);
                const selected = selectedIds.has(item.id);
                return (
                <div
                  key={item.id}
                  onClick={
                    trashView
                      ? undefined
                      : selectMode
                        ? () => toggleSelect(item.id)
                        : () => setModal({ mode: "edit", item })
                  }
                  onKeyDown={
                    trashView
                      ? undefined
                      : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (selectMode) toggleSelect(item.id);
                            else setModal({ mode: "edit", item });
                          }
                        }
                  }
                  role={trashView ? undefined : "button"}
                  tabIndex={trashView ? undefined : 0}
                  aria-pressed={selectMode ? selected : undefined}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-colors ${
                    selectMode && selected
                      ? "border-accent/50 bg-accent/5 cursor-pointer"
                      : "border-border/50 hover:bg-foreground/[0.02]"
                  } ${trashView ? "" : "cursor-pointer"}`}
                >
                  {selectMode && (
                    <span
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                        selected ? "border-accent bg-accent text-white" : "border-border"
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </span>
                  )}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                      <Badge variant={STATUS_META[item.expiryStatus].variant}>
                        {STATUS_META[item.expiryStatus].label}
                      </Badge>
                      {distanceText && (
                        <span
                          className={`flex-shrink-0 text-xs ${
                            item.expiryStatus === "expired" ? "text-red-500" : "text-amber-600"
                          }`}
                        >
                          {distanceText}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted flex flex-wrap items-center gap-x-2">
                      <span>{item.locationName}</span>
                      <span>
                        效期{" "}
                        {item.expiryPrecision === "month"
                          ? `${item.effectiveExpiry.slice(0, 7)}（月）`
                          : item.effectiveExpiry}
                      </span>
                      {item.quantity && <span>{item.quantity}</span>}
                      {item.usageText && <span>用法 {item.usageText}</span>}
                      {item.spec && <span className="truncate">{item.spec}</span>}
                    </p>
                  </div>
                  {/* 行点击进编辑，操作区拦截冒泡 */}
                  <div
                    className="flex items-center gap-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {trashView ? (
                      <>
                        <IconButton onClick={() => handleRestore(item)} label="恢复" title="恢复">
                          <RotateCcw className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          onClick={() => setPurgeTarget(item)}
                          label="彻底删除"
                          title="彻底删除"
                          variant="danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </>
                    ) : selectMode ? null : (
                      <>
                        <IconButton
                          href={`/admin/medicine/labels?ids=${item.id}`}
                          label="打印标签"
                          title="打印标签"
                        >
                          <QrCode className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          onClick={() => setDeleteTarget(item)}
                          label="删除"
                          title="删除"
                          variant="danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          ) : search || statusFilter !== "all" ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted mb-3">无匹配结果</p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="text-sm text-accent hover:underline"
              >
                清除筛选
              </button>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-muted">
              {loadFailed
                ? "数据加载失败"
                : trashView
                  ? "回收站是空的"
                  : "暂无药品，点右上角「新增药品」开始录入"}
            </p>
          )}
        </div>
      )}

      {/* 贴标模式底部操作条 */}
      {selectMode && (
        <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-xl border border-border/50 bg-background px-4 py-3 shadow-lg">
          <span className="text-sm text-muted">已选 {selectedIds.size} 个</span>
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => router.push(`/admin/medicine/labels?ids=${[...selectedIds].join(",")}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            打印标签
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectMode(false);
              setSelectedIds(new Set());
            }}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            取消
          </button>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={safeAnimate(reduce, { opacity: 0 })}
              animate={{ opacity: 1 }}
              exit={safeAnimate(reduce, { opacity: 0 })}
              onClick={() => setModal(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
              transition={springModal}
              className="fixed inset-0 flex items-center justify-center z-[101] p-6 max-sm:p-0"
            >
              <div
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="med-modal-title"
                className="relative w-full max-w-3xl bg-background rounded-2xl border border-border/50 shadow-xl overflow-hidden max-h-[90dvh] flex flex-col max-sm:rounded-none max-sm:max-h-none max-sm:h-dvh"
              >
                <div className="absolute z-10 top-[calc(1rem+env(safe-area-inset-top,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))]">
                  <IconButton label="关闭窗口" onClick={() => setModal(null)} size="lg">
                    <X className="w-4 h-4" />
                  </IconButton>
                </div>

                <div className="pb-4 flex-shrink-0 pt-[calc(2rem+env(safe-area-inset-top,0px))] pl-[calc(1.5rem+env(safe-area-inset-left,0px))] pr-[calc(4rem+env(safe-area-inset-right,0px))] sm:pl-8 sm:pr-16">
                  <h2 id="med-modal-title" className="text-xl font-bold text-foreground">
                    {modal.mode === "edit" ? "编辑药品" : "新增药品"}
                  </h2>
                </div>

                <div className="pl-[calc(1.5rem+env(safe-area-inset-left,0px))] pr-[calc(1.5rem+env(safe-area-inset-right,0px))] sm:px-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] overflow-y-auto">
                  <MedForm
                    key={modal.mode === "edit" ? modal.item.id : "new"}
                    locations={locations}
                    initialValues={modal.mode === "edit" ? medValuesFromItem(modal.item) : blankMedValues()}
                    autoFocusName={modal.mode === "create"}
                    onSubmit={handleSubmit}
                    onCancel={() => setModal(null)}
                    onLocationsChanged={reloadLocations}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleSoftDelete}
        title="删除药品"
        message={`确定要删除「${deleteTarget?.name || ""}」吗？删除后 30 天内可在回收站恢复。`}
        confirmLabel="删除"
        danger={true}
      />

      <ConfirmDialog
        isOpen={purgeTarget !== null}
        onClose={() => setPurgeTarget(null)}
        onConfirm={handlePurge}
        title="彻底删除"
        message={`确定要彻底删除「${purgeTarget?.name || ""}」吗？此操作不可撤销。`}
        confirmLabel="彻底删除"
        danger={true}
      />
    </div>
  );
}
