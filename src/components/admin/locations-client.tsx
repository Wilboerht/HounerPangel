"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/admin/page-header";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { IconButton } from "@/components/admin/icon-button";
import { useAuthExpired } from "@/lib/use-auth-expired";
import type { MedLocation } from "@/lib/types/medicine";

const inputCls =
  "px-3 py-2 rounded-lg bg-foreground/5 border border-border/50 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors";

export function LocationsClient() {
  const toast = useToast();
  const authExpired = useAuthExpired();

  const [locations, setLocations] = useState<MedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState("");
  const [newContainerNames, setNewContainerNames] = useState<Record<number, string>>({});

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await fetch("/api/medicine/locations", { signal });
        if (res.status === 401) {
          authExpired();
          return;
        }
        if (!res.ok) throw new Error("load failed");
        setLocations(await res.json());
        setLoading(false);
      } catch {
        if (signal?.aborted) return;
        toast.error("加载位置列表失败，请刷新重试");
        setLoading(false);
      }
    },
    [toast, authExpired]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const createLocation = async (name: string, parentId: number | null) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/medicine/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, parentId }),
      });
      if (res.status === 401) {
        authExpired();
        return;
      }
      if (res.ok) {
        toast.success("位置已添加");
        load();
        return;
      }
      const data = await res.json();
      toast.error(data.error || "添加失败");
    } catch {
      toast.error("添加失败");
    }
  };

  const deleteLocation = async (loc: MedLocation) => {
    try {
      const res = await fetch(`/api/medicine/locations/${loc.id}`, { method: "DELETE" });
      if (res.status === 401) {
        authExpired();
        return;
      }
      if (res.ok) {
        toast.success("位置已删除");
        load();
        return;
      }
      const data = await res.json();
      toast.error(data.error || "删除失败");
    } catch {
      toast.error("删除失败");
    }
  };

  const rooms = locations.filter((l) => l.parentId === null);
  const containersOf = (roomId: number) => locations.filter((l) => l.parentId === roomId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="位置管理"
        description="两级结构：房间 / 容器；被药品引用的位置不可删除"
        actions={
          <Link
            href="/admin/medicine"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回药箱
          </Link>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="加载中">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-border/50 bg-foreground/[0.03] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {rooms.map((room) => (
            <DashboardCard
              key={room.id}
              title={room.name}
              action={
                <IconButton
                  onClick={() => deleteLocation(room)}
                  label={`删除房间 ${room.name}`}
                  title="删除房间"
                  variant="danger"
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              }
            >
              <div className="flex flex-col gap-3">
                {containersOf(room.id).length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {containersOf(room.id).map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border/50"
                      >
                        <span className="text-sm text-foreground">{c.name}</span>
                        <IconButton
                          onClick={() => deleteLocation(c)}
                          label={`删除容器 ${c.name}`}
                          title="删除容器"
                          variant="danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">还没有容器</p>
                )}
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    createLocation(newContainerNames[room.id] ?? "", room.id);
                    setNewContainerNames((prev) => ({ ...prev, [room.id]: "" }));
                  }}
                >
                  <input
                    type="text"
                    value={newContainerNames[room.id] ?? ""}
                    onChange={(e) =>
                      setNewContainerNames((prev) => ({ ...prev, [room.id]: e.target.value }))
                    }
                    placeholder="新容器名，如：抽屉"
                    maxLength={100}
                    className={`${inputCls} flex-1 min-w-0`}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                </form>
              </div>
            </DashboardCard>
          ))}

          <DashboardCard title="新增房间">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                createLocation(newRoomName, null);
                setNewRoomName("");
              }}
            >
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="房间名，如：书房"
                maxLength={100}
                className={`${inputCls} flex-1 min-w-0`}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </form>
          </DashboardCard>
        </>
      )}
    </div>
  );
}
