export interface MedLocation {
    id: number;
    name: string;
    parentId: number | null;
    sortOrder: number;
}

export type ExpiryPrecision = "day" | "month";

export interface MedItem {
    id: number;
    name: string;
    tradeName: string | null;
    spec: string | null;
    dosageForm: string | null;
    category: string | null;
    quantity: string | null;
    locationId: number;
    // YYYY-MM-DD；月精度时为当月 1 日
    expiryDate: string;
    expiryPrecision: ExpiryPrecision;
    openedAt: string | null;
    afterOpeningExpiry: string | null;
    usageText: string | null;
    note: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export type ExpiryStatus = "expired" | "expiring" | "ok";

export interface MedItemWithStatus extends MedItem {
    // min(原效期, 开封后效期)，实时派生
    effectiveExpiry: string;
    expiryStatus: ExpiryStatus;
    // 冗余位置名（"卧室/药箱"），省得客户端再 join
    locationName: string;
}
