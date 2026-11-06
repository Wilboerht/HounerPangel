"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { IconButton } from "@/components/admin/icon-button";
import { Button } from "@/components/admin/button";
import { Dialog } from "@/components/admin/dialog";
import { EmptyState, ErrorState, LoadingRows } from "@/components/admin/states";
import { fieldClass } from "@/components/admin/field-classes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FootprintMapLazy } from "@/components/footprint-map-lazy";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import type { CityInput, ManagedCity } from "@/lib/cities";
import type { City } from "@/data/cities";

interface CityForm {
    name: string;
    longitude: string;
    latitude: string;
    status: "visited" | "planned";
    visitDate: string;
    note: string;
}

interface CitySearchResult {
    id: string;
    name: string;
    displayName: string;
    coordinates: [number, number];
}

const blankForm: CityForm = { name: "", longitude: "116.3974", latitude: "39.9093", status: "visited", visitDate: "", note: "" };

function parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index++) {
        const char = line[index];
        if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index++; }
        else if (char === '"') quoted = !quoted;
        else if (char === "," && !quoted) { values.push(value.trim()); value = ""; }
        else value += char;
    }
    values.push(value.trim());
    return values;
}

export function CitiesAdminClient() {
    const toast = useToast();
    const authExpired = useAuthExpired();
    const fileRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<AbortController | null>(null);
    const [cities, setCities] = useState<ManagedCity[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [editing, setEditing] = useState<ManagedCity | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<CityForm>(blankForm);
    const [formBaseline, setFormBaseline] = useState<CityForm>(blankForm);
    const [pendingClose, setPendingClose] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<ManagedCity | null>(null);
    const [importing, setImporting] = useState(false);
    const [pendingImport, setPendingImport] = useState<CityInput[] | null>(null);
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
    const [searchMessage, setSearchMessage] = useState("");
    const [mapFocus, setMapFocus] = useState<[number, number] | null>(null);

    const load = useCallback(async (signal?: AbortSignal) => {
        try {
            const res = await fetch("/api/admin/cities", { signal });
            if (res.status === 401) { authExpired(); return; }
            if (!res.ok) throw new Error("加载失败");
            setCities(await res.json());
            setFailed(false);
        } catch { if (!signal?.aborted) setFailed(true); }
        finally { if (!signal?.aborted) setLoading(false); }
    }, [authExpired]);

    useEffect(() => {
        const controller = new AbortController();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 挂载时加载城市数据
        load(controller.signal);
        return () => {
            controller.abort();
            searchRef.current?.abort();
        };
    }, [load]);

    const openForm = (city?: ManagedCity) => {
        searchRef.current?.abort();
        const initial = city ? { name: city.name, longitude: String(city.coordinates[0]), latitude: String(city.coordinates[1]), status: city.status ?? "visited", visitDate: city.visitDate ?? "", note: city.note ?? "" } : blankForm;
        setEditing(city ?? null);
        setForm(initial);
        setFormBaseline(initial);
        setPendingClose(false);
        setSearching(false);
        setSearchResults([]);
        setSearchMessage("");
        setMapFocus(null);
        setFormOpen(true);
    };

    const formDirty = formOpen && JSON.stringify(form) !== JSON.stringify(formBaseline);
    const dismissForm = () => {
        searchRef.current?.abort();
        setPendingClose(false);
        setFormOpen(false);
    };
    const closeForm = () => {
        if (saving) return;
        if (formDirty) {
            setPendingClose(true);
            return;
        }
        dismissForm();
    };

    useDirtyGuard(formDirty, () => setPendingClose(true));
    const updateName = (name: string) => {
        searchRef.current?.abort();
        setForm((current) => ({ ...current, name }));
        setSearching(false);
        setSearchResults([]);
        setSearchMessage("");
    };

    const searchCity = async () => {
        const query = form.name.trim();
        if (!query) { setSearchMessage("请先输入城市名称"); return; }
        searchRef.current?.abort();
        const controller = new AbortController();
        searchRef.current = controller;
        setSearching(true);
        setSearchResults([]);
        setSearchMessage("");
        try {
            const res = await fetch(`/api/admin/cities/geocode?q=${encodeURIComponent(query)}`, { signal: controller.signal });
            if (res.status === 401) { authExpired(); return; }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "城市搜索失败");
            const results = data.results as CitySearchResult[];
            setSearchResults(results);
            setSearchMessage(results.length === 0 ? "未找到匹配地点，请尝试添加国家或省份，或点击地图选点" : "");
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
            setSearchMessage(error instanceof Error ? error.message : "城市搜索失败，请稍后重试");
        } finally {
            if (searchRef.current === controller) setSearching(false);
        }
    };

    const selectSearchResult = (result: CitySearchResult) => {
        setForm((current) => ({ ...current, longitude: result.coordinates[0].toFixed(6), latitude: result.coordinates[1].toFixed(6) }));
        setMapFocus(result.coordinates);
        setSearchResults([]);
        setSearchMessage("已填入坐标并定位地图，你也可以继续手动微调");
    };

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const payload: CityInput = { name: form.name.trim(), coordinates: [Number(form.longitude), Number(form.latitude)], status: form.status, visitDate: form.visitDate || null, note: form.note.trim() || null };
            const res = await fetch(editing ? `/api/admin/cities/${editing.id}` : "/api/admin/cities", {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing ? { ...payload, expectedUpdatedAt: editing.updatedAt } : payload),
            });
            if (res.status === 401) { authExpired(); return; }
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || "保存失败"); return; }
            toast.success(editing ? "城市已更新" : "城市已新增");
            dismissForm();
            await load();
        } catch { toast.error("网络错误，请重试"); } finally { setSaving(false); }
    };

    const remove = async () => {
        if (!deleting) return;
        try {
            const res = await fetch(`/api/admin/cities/${deleting.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expectedUpdatedAt: deleting.updatedAt }),
            });
            if (res.status === 401) { authExpired(); return; }
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || "删除城市失败"); return; }
            setCities((items) => items.filter((item) => item.id !== deleting.id));
            setDeleting(null);
            toast.success("城市已删除");
        } catch { toast.error("网络错误，请重试"); }
    };

    const importCsv = async (file: File | undefined) => {
        if (!file) return;
        try {
            const lines = (await file.text()).split(/\r?\n/).filter((line) => line.trim());
            const rows = lines.slice(1).map(parseCsvLine);
            const payload = rows.map((row): CityInput => ({
                name: row[0], coordinates: [Number(row[1]), Number(row[2])],
                status: row[3] === "planned" ? "planned" : "visited",
                visitDate: row[4] || null, note: row[5] || null,
            }));
            if (payload.length === 0) throw new Error("CSV 中没有可导入的城市记录");
            if (payload.some((row) =>
                !row.name ||
                !Number.isFinite(row.coordinates[0]) ||
                !Number.isFinite(row.coordinates[1]) ||
                (row.visitDate && (!/^\d{4}-\d{2}$/.test(row.visitDate) || Number(row.visitDate.slice(5)) < 1 || Number(row.visitDate.slice(5)) > 12))
            )) throw new Error("CSV 格式不正确");
            setPendingImport(payload);
        } catch (error) { toast.error(error instanceof Error ? error.message : "CSV 导入失败"); }
        finally { if (fileRef.current) fileRef.current.value = ""; }
    };

    const performImport = async () => {
        if (!pendingImport || importing) return;
        setImporting(true);
        try {
            const res = await fetch("/api/admin/cities/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pendingImport) });
            if (res.status === 401) { authExpired(); return; }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "导入失败");
            toast.success(`已导入或更新 ${data.count} 个城市`);
            setPendingImport(null);
            await load();
        } catch (error) { toast.error(error instanceof Error ? error.message : "CSV 导入失败"); }
        finally { setImporting(false); }
    };

    const draftCity: City[] = formOpen && Number.isFinite(Number(form.longitude)) && Number.isFinite(Number(form.latitude)) ? [{ name: form.name || "当前位置", coordinates: [Number(form.longitude), Number(form.latitude)], status: form.status }] : [];

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="足迹管理" description="管理已到访和计划前往的城市，点击地图可直接选点" actions={
                <div className="flex gap-2">
                    <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => importCsv(event.target.files?.[0])} />
                    <Button variant="secondary" size="lg" disabled={importing} onClick={() => fileRef.current?.click()}>
                        <Upload className="h-4 w-4" />{importing ? "导入中..." : "导入 CSV"}
                    </Button>
                    <Button variant="primary" size="lg" onClick={() => openForm()}>
                        <Plus className="h-4 w-4" />新增城市
                    </Button>
                </div>
            } />
            <p className="text-xs text-muted">CSV 表头：name,longitude,latitude,status,visitDate,note；status 为 visited 或 planned，日期格式为 YYYY-MM。</p>

            <Dialog
                open={formOpen}
                onClose={closeForm}
                title={editing ? "编辑城市" : "新增城市"}
                size="2xl"
                closeDisabled={saving}
                closeLabel="关闭城市表单"
            >
                <form onSubmit={save} className="grid gap-4 lg:grid-cols-2">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <input
                                aria-label="城市名称"
                                autoFocus
                                required
                                maxLength={100}
                                value={form.name}
                                onChange={(event) => updateName(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                                        event.preventDefault();
                                        void searchCity();
                                    }
                                }}
                                placeholder="输入城市名称，如：杭州"
                                className={fieldClass}
                            />
                            <Button type="button" size="lg" disabled={searching} onClick={() => void searchCity()} className="shrink-0">
                                {searching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                {searching ? "搜索中" : "搜索"}
                            </Button>
                        </div>
                        {searchResults.length > 0 && (
                            <ul aria-label="城市搜索结果" className="max-h-40 divide-y divide-border/50 overflow-y-auto rounded-lg border border-border/50">
                                {searchResults.map((result) => (
                                    <li key={result.id}>
                                        <button type="button" onClick={() => selectSearchResult(result)} className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-foreground/5">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                                            <span className="min-w-0"><span className="block text-sm font-medium">{result.name}</span><span className="block text-xs text-muted">{result.displayName}</span></span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {searchMessage && <p role="status" className="text-xs text-muted">{searchMessage}</p>}
                        <div className="grid grid-cols-2 gap-2">
                            <input aria-label="经度" required type="number" step="any" min={-180} max={180} value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} placeholder="经度" className={fieldClass} />
                            <input aria-label="纬度" required type="number" step="any" min={-90} max={90} value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} placeholder="纬度" className={fieldClass} />
                        </div>
                        <select aria-label="足迹状态" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "visited" | "planned" })} className={fieldClass}>
                            <option value="visited">已到访</option>
                            <option value="planned">计划前往</option>
                        </select>
                        <input aria-label="到访时间" value={form.visitDate} onChange={(event) => setForm({ ...form, visitDate: event.target.value })} placeholder="到访时间，如 2026-10" pattern="\d{4}-\d{2}" className={fieldClass} />
                        <textarea aria-label="备注" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="一句话备注" maxLength={1000} rows={3} className={fieldClass} />
                    </div>
                    <div className="h-72 overflow-hidden rounded-lg border border-border/50">
                        <FootprintMapLazy cities={[...cities, ...draftCity]} focusCoordinates={mapFocus} onLocationSelect={([longitude, latitude]) => setForm((current) => ({ ...current, longitude: longitude.toFixed(6), latitude: latitude.toFixed(6) }))} />
                    </div>
                    <div className="flex justify-end gap-2 lg:col-span-2">
                        <Button type="button" size="lg" onClick={closeForm}>取消</Button>
                        <Button type="submit" variant="primary" size="lg" disabled={saving}>{saving ? "保存中..." : "保存城市"}</Button>
                    </div>
                </form>
            </Dialog>

            {loading ? (
                <LoadingRows count={4} className="h-20" />
            ) : failed ? (
                <ErrorState title="足迹加载失败" onRetry={() => { setLoading(true); load(); }} />
            ) : cities.length === 0 ? (
                <EmptyState
                    icon={MapPin}
                    title="还没有记录任何城市"
                    description="新增城市或导入 CSV，开始绘制你的足迹地图"
                    action={
                        <Button variant="primary" onClick={() => openForm()}>
                            <Plus className="h-4 w-4" />新增城市
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                    {cities.map((city) => (
                        <div key={city.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-foreground/[0.03]">
                            <MapPin className={`h-4 w-4 flex-shrink-0 ${city.status === "planned" ? "text-accent" : "text-muted"}`} />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">{city.name}<span className="ml-2 text-xs font-normal text-muted">{city.status === "planned" ? "计划前往" : "已到访"}</span></p>
                                <p className="truncate text-xs text-muted">{city.coordinates.join(", ")}{city.visitDate ? ` · ${city.visitDate}` : ""}{city.note ? ` · ${city.note}` : ""}</p>
                            </div>
                            <IconButton size="adaptive" label={`编辑 ${city.name}`} onClick={() => openForm(city)}><Pencil className="h-4 w-4" /></IconButton>
                            <IconButton size="adaptive" label={`删除 ${city.name}`} variant="danger" onClick={() => setDeleting(city)}><Trash2 className="h-4 w-4" /></IconButton>
                        </div>
                    ))}
                </div>
            )}
            <ConfirmDialog isOpen={deleting !== null} onClose={() => setDeleting(null)} onConfirm={remove} title="删除城市" message={`确定从足迹地图删除「${deleting?.name ?? ""}」吗？`} confirmLabel="确认删除" />
            <ConfirmDialog
                isOpen={pendingClose}
                onClose={() => setPendingClose(false)}
                onConfirm={dismissForm}
                title="放弃城市编辑"
                message="有尚未保存的城市信息，确定关闭并丢弃这些更改吗？"
                confirmLabel="放弃更改"
                danger={false}
            />
            <ConfirmDialog
                isOpen={pendingImport !== null}
                onClose={() => setPendingImport(null)}
                onConfirm={performImport}
                title="确认导入城市"
                message={`将导入 ${pendingImport?.length ?? 0} 条记录。同名城市的现有坐标、状态和备注会被覆盖，确定继续吗？`}
                confirmLabel="确认导入"
            />
        </div>
    );
}
