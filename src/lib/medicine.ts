import type { ExpiryPrecision, ExpiryStatus, MedItem, MedItemWithStatus } from "./types/medicine";

// 剂型和类别的下拉选项（PRD 3.2）
export const DOSAGE_FORMS = ["片剂", "胶囊", "糖浆", "滴眼液", "软膏", "外用", "其他"] as const;
export const CATEGORIES = ["慢病", "急救", "儿童", "感冒", "肠胃", "外用", "其他"] as const;

// 开封后效期建议（PRD 3.2）：选中开封日期 + 剂型时预填
export const AFTER_OPENING_SUGGESTION_DAYS: Record<string, number> = {
    滴眼液: 28,
    糖浆: 28,
    胰岛素: 28,
    硝酸甘油: 90,
};

export const EXPIRING_SOON_DAYS = 30;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

// 本地时区的 YYYY-MM-DD；toISOString 是 UTC，UTC+8 早上 8 点前会差一天
export function todayLocal(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
}

function isValidDateString(val: string): boolean {
    if (!DATE_RE.test(val)) return false;
    const d = new Date(val + "T00:00:00Z");
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === val;
}

// 效期输入归一化：YYYY-MM-DD 原样；YYYY-MM 按当月 1 日存（宁早勿晚）。非法返回 null
export function normalizeExpiry(input: string): { date: string; precision: ExpiryPrecision } | null {
    const trimmed = input.trim();
    if (MONTH_RE.test(trimmed)) {
        const date = `${trimmed}-01`;
        return isValidDateString(date) ? { date, precision: "month" } : null;
    }
    if (isValidDateString(trimmed)) return { date: trimmed, precision: "day" };
    return null;
}

export function computeEffectiveExpiry(item: Pick<MedItem, "expiryDate" | "afterOpeningExpiry">): string {
    const { expiryDate, afterOpeningExpiry } = item;
    if (afterOpeningExpiry && afterOpeningExpiry < expiryDate) return afterOpeningExpiry;
    return expiryDate;
}

export function getExpiryStatus(effectiveExpiry: string, today = todayLocal()): ExpiryStatus {
    if (effectiveExpiry < today) return "expired";
    const limit = new Date(today + "T00:00:00Z");
    limit.setUTCDate(limit.getUTCDate() + EXPIRING_SOON_DAYS);
    if (effectiveExpiry <= limit.toISOString().slice(0, 10)) return "expiring";
    return "ok";
}

export function withExpiryStatus(item: MedItem, locationName: string, today = todayLocal()): MedItemWithStatus {
    const effectiveExpiry = computeEffectiveExpiry(item);
    return {
        ...item,
        locationName,
        effectiveExpiry,
        expiryStatus: getExpiryStatus(effectiveExpiry, today),
    };
}

// 开封日期 + 天数 → 建议的开封后效期
export function suggestAfterOpeningExpiry(openedAt: string, days: number): string | null {
    if (!isValidDateString(openedAt)) return null;
    const d = new Date(openedAt + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}
