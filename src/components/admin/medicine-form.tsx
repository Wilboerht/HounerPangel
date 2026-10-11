"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import {
  AFTER_OPENING_SUGGESTION_DAYS,
  CATEGORIES,
  DOSAGE_FORMS,
  suggestAfterOpeningExpiry,
} from "@/lib/medicine";
import type { MedItemWithStatus, MedLocation } from "@/lib/types/medicine";

export interface MedFormValues {
  name: string;
  tradeName: string;
  spec: string;
  dosageForm: string;
  category: string;
  quantity: string;
  locationId: number | null;
  // YYYY-MM-DD 或 YYYY-MM（月精度），服务端归一化
  expiry: string;
  openedAt: string;
  afterOpeningExpiry: string;
  usageText: string;
  note: string;
}

export function blankMedValues(): MedFormValues {
  return {
    name: "",
    tradeName: "",
    spec: "",
    dosageForm: "",
    category: "",
    quantity: "",
    locationId: null,
    expiry: "",
    openedAt: "",
    afterOpeningExpiry: "",
    usageText: "",
    note: "",
  };
}

export function medValuesFromItem(item: MedItemWithStatus): MedFormValues {
  return {
    name: item.name,
    tradeName: item.tradeName ?? "",
    spec: item.spec ?? "",
    dosageForm: item.dosageForm ?? "",
    category: item.category ?? "",
    quantity: item.quantity ?? "",
    locationId: item.locationId,
    expiry: item.expiryPrecision === "month" ? item.expiryDate.slice(0, 7) : item.expiryDate,
    openedAt: item.openedAt ?? "",
    afterOpeningExpiry: item.afterOpeningExpiry ?? "",
    usageText: item.usageText ?? "",
    note: item.note ?? "",
  };
}

const inputCls =
  "w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors";
const labelCls = "text-sm font-medium text-foreground";

interface MedFormProps {
  locations: MedLocation[];
  initialValues?: MedFormValues;
  autoFocusName?: boolean;
  onSubmit: (values: MedFormValues) => Promise<boolean>;
  onCancel: () => void;
  // 表单内新建位置成功后回调，父组件重新拉取位置列表
  onLocationsChanged?: () => void;
}

export function MedForm({ locations, initialValues, autoFocusName, onSubmit, onCancel, onLocationsChanged }: MedFormProps) {
  const [form, setForm] = useState<MedFormValues>(() => initialValues ?? blankMedValues());
  const [saving, setSaving] = useState(false);
  // 月精度是输入模式而非值格式：/^\d{4}-\d{2}$/ 的值在月模式下输入
  const [monthPrecision, setMonthPrecision] = useState(() => /^\d{4}-\d{2}$/.test(form.expiry));

  // 表单内新建的位置：父组件刷新前先合并进本地，保证下拉能立即选中新项
  const [extraLocations, setExtraLocations] = useState<MedLocation[]>([]);
  const allLocations = (() => {
    const map = new Map<number, MedLocation>();
    for (const l of [...locations, ...extraLocations]) map.set(l.id, l);
    return [...map.values()];
  })();

  const [showNewLocation, setShowNewLocation] = useState(false);
  const [newLocRoomId, setNewLocRoomId] = useState<string>("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newContainerName, setNewContainerName] = useState("");
  const [locSaving, setLocSaving] = useState(false);
  const [locError, setLocError] = useState("");

  const updateField = (patch: Partial<MedFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // 开封日期 + 剂型命中建议表时，预填开封后效期（不覆盖手填值）
  const maybeSuggestAfterOpening = (openedAt: string, dosageForm: string) => {
    if (!openedAt || form.afterOpeningExpiry) return;
    const days = AFTER_OPENING_SUGGESTION_DAYS[dosageForm];
    if (!days) return;
    const suggested = suggestAfterOpeningExpiry(openedAt, days);
    if (suggested) updateField({ afterOpeningExpiry: suggested });
  };

  const rooms = allLocations.filter((l) => l.parentId === null);
  const containersOf = (roomId: number) => allLocations.filter((l) => l.parentId === roomId);

  const valid = form.name.trim() !== "" && form.locationId !== null && form.expiry !== "";
  const missing = [
    form.name.trim() === "" ? "名称" : null,
    form.locationId === null ? "位置" : null,
    form.expiry === "" ? "原效期" : null,
  ].filter(Boolean) as string[];

  const postLocation = async (name: string, parentId: number | null): Promise<MedLocation | null> => {
    const res = await fetch("/api/medicine/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId }),
    });
    if (res.ok) return (await res.json()) as MedLocation;
    const data = await res.json().catch(() => null);
    setLocError(data?.error || "添加位置失败");
    return null;
  };

  const handleAddLocation = async () => {
    setLocError("");
    const containerName = newContainerName.trim();
    const created: MedLocation[] = [];
    let parentId: number | null = null;
    let selected: MedLocation | null = null;

    setLocSaving(true);
    try {
      if (newLocRoomId === "new") {
        const roomName = newRoomName.trim();
        if (!roomName) {
          setLocError("请填写新房间名");
          return;
        }
        const room = await postLocation(roomName, null);
        if (!room) return;
        created.push(room);
        parentId = room.id;
        selected = room;
      } else if (newLocRoomId) {
        // 已有房间下必须落到一个容器，不能只选房间
        if (!containerName) {
          setLocError("请填写容器名");
          return;
        }
        parentId = Number(newLocRoomId);
      } else {
        setLocError("请选择房间");
        return;
      }

      if (containerName) {
        const container = await postLocation(containerName, parentId);
        if (!container) return;
        created.push(container);
        selected = container;
      }

      if (selected) {
        setExtraLocations((prev) => [...prev, ...created]);
        updateField({ locationId: selected.id });
      }
      onLocationsChanged?.();
      setShowNewLocation(false);
      setNewLocRoomId("");
      setNewRoomName("");
      setNewContainerName("");
    } finally {
      setLocSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="med-name" className={labelCls}>
          名称 <span className="text-red-500">*</span>
        </label>
        <input
          id="med-name"
          type="text"
          value={form.name}
          onChange={(e) => updateField({ name: e.target.value })}
          placeholder="通用名，如：阿托伐他汀钙片"
          maxLength={200}
          required
          autoFocus={autoFocusName}
          className={inputCls}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="med-trade-name" className={labelCls}>商品名</label>
          <input
            id="med-trade-name"
            type="text"
            value={form.tradeName}
            onChange={(e) => updateField({ tradeName: e.target.value })}
            maxLength={200}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="med-spec" className={labelCls}>规格</label>
          <input
            id="med-spec"
            type="text"
            value={form.spec}
            onChange={(e) => updateField({ spec: e.target.value })}
            placeholder="如：20mg×20片/盒"
            maxLength={100}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="med-dosage-form" className={labelCls}>剂型</label>
          <select
            id="med-dosage-form"
            value={form.dosageForm}
            onChange={(e) => {
              updateField({ dosageForm: e.target.value });
              maybeSuggestAfterOpening(form.openedAt, e.target.value);
            }}
            className={inputCls}
          >
            <option value="">未选择</option>
            {DOSAGE_FORMS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="med-category" className={labelCls}>类别</label>
          <select
            id="med-category"
            value={form.category}
            onChange={(e) => updateField({ category: e.target.value })}
            className={inputCls}
          >
            <option value="">未选择</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="med-quantity" className={labelCls}>数量</label>
          <input
            id="med-quantity"
            type="text"
            value={form.quantity}
            onChange={(e) => updateField({ quantity: e.target.value })}
            placeholder="如：2 盒、剩 8 片"
            maxLength={50}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="med-location" className={labelCls}>
            位置 <span className="text-red-500">*</span>
          </label>
          <select
            id="med-location"
            value={form.locationId ?? ""}
            onChange={(e) => updateField({ locationId: e.target.value ? Number(e.target.value) : null })}
            required
            className={inputCls}
          >
            <option value="" disabled>选择位置</option>
            {rooms.map((room) => {
              const containers = containersOf(room.id);
              if (containers.length === 0) {
                return <option key={room.id} value={room.id}>{room.name}</option>;
              }
              return (
                <optgroup key={room.id} label={room.name}>
                  {containers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>

          {showNewLocation || allLocations.length === 0 ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border/50 p-3">
              {allLocations.length === 0 && (
                <p className="text-xs text-muted">还没有位置，先新建一个（如：卧室 / 药箱）</p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  aria-label="选择已有房间或新建房间"
                  value={newLocRoomId}
                  onChange={(e) => setNewLocRoomId(e.target.value)}
                  className={inputCls}
                >
                  <option value="" disabled>选择房间</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={String(room.id)}>{room.name}</option>
                  ))}
                  <option value="new">+ 新房间</option>
                </select>
                {newLocRoomId === "new" && (
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="新房间名，如：书房"
                    maxLength={100}
                    className={inputCls}
                  />
                )}
                <input
                  type="text"
                  value={newContainerName}
                  onChange={(e) => setNewContainerName(e.target.value)}
                  placeholder={
                    newLocRoomId === "new" ? "容器名（可选），如：抽屉" : "容器名，如：药箱"
                  }
                  maxLength={100}
                  className={inputCls}
                />
              </div>
              {locError && <p className="text-xs text-red-500">{locError}</p>}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddLocation}
                  disabled={locSaving}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                >
                  {locSaving ? "添加中..." : "添加位置"}
                </button>
                {allLocations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewLocation(false);
                      setLocError("");
                    }}
                    className="text-xs text-muted hover:text-foreground transition-colors"
                  >
                    取消
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewLocation(true)}
              className="self-start text-xs text-accent hover:underline"
            >
              + 新建位置
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="med-expiry" className={labelCls}>
            原效期 <span className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-muted">精确到日或月（月按当月 1 日算）</span>
          </label>
          <input
            id="med-expiry"
            type={monthPrecision ? "month" : "date"}
            value={form.expiry}
            onChange={(e) => updateField({ expiry: e.target.value })}
            required
            className={inputCls}
          />
          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={monthPrecision}
              onChange={(e) => {
                setMonthPrecision(e.target.checked);
                // 切到月精度时把日期截到月份；切回日精度时值清空重选，避免非法中间态
                updateField({ expiry: e.target.checked ? form.expiry.slice(0, 7) : "" });
              }}
              className="accent-foreground"
            />
            只知道月份（如药盒上只印了 YYYY-MM）
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="med-opened-at" className={labelCls}>开封日期</label>
          <input
            id="med-opened-at"
            type="date"
            value={form.openedAt}
            onChange={(e) => {
              updateField({ openedAt: e.target.value });
              maybeSuggestAfterOpening(e.target.value, form.dosageForm);
            }}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="med-after-opening" className={labelCls}>
            开封后效期
            {form.afterOpeningExpiry && (
              <span className="ml-2 text-xs font-normal text-muted">有效效期取原效期与开封后效期的较早者</span>
            )}
          </label>
          <input
            id="med-after-opening"
            type="date"
            value={form.afterOpeningExpiry}
            onChange={(e) => updateField({ afterOpeningExpiry: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="med-usage" className={labelCls}>用法</label>
          <input
            id="med-usage"
            type="text"
            value={form.usageText}
            onChange={(e) => updateField({ usageText: e.target.value })}
            placeholder="如：每晚 1 片"
            maxLength={200}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="med-note" className={labelCls}>备注</label>
        <textarea
          id="med-note"
          value={form.note}
          onChange={(e) => updateField({ note: e.target.value })}
          rows={3}
          maxLength={2000}
          className={`${inputCls} resize-y`}
        />
      </div>

      {/* sticky 底部操作栏：长表单下保存/取消始终可达；含底部安全区避让 */}
      <div className="sticky bottom-0 -mx-4 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-background/85 backdrop-blur-sm flex items-center gap-4">
        <button
          type="submit"
          disabled={saving || !valid}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          取消
        </button>
        {!valid && (
          <span className="text-xs text-muted">还需填写：{missing.join("、")}</span>
        )}
      </div>
    </form>
  );
}
