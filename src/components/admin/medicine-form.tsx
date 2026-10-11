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
}

export function MedForm({ locations, initialValues, autoFocusName, onSubmit, onCancel }: MedFormProps) {
  const [form, setForm] = useState<MedFormValues>(() => initialValues ?? blankMedValues());
  const [saving, setSaving] = useState(false);
  // 月精度是输入模式而非值格式：/^\d{4}-\d{2}$/ 的值在月模式下输入
  const [monthPrecision, setMonthPrecision] = useState(() => /^\d{4}-\d{2}$/.test(form.expiry));

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

  const rooms = locations.filter((l) => l.parentId === null);
  const containersOf = (roomId: number) => locations.filter((l) => l.parentId === roomId);

  const valid = form.name.trim() !== "" && form.locationId !== null && form.expiry !== "";

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
            placeholder='如："2 盒""剩 8 片"'
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
      </div>
    </form>
  );
}
