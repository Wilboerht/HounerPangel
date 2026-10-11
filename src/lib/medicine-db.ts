import "server-only";

import { randomBytes } from "node:crypto";
import { supabase } from "./supabase";
import { withExpiryStatus } from "./medicine";
import type { MedItem, MedItemWithStatus, MedLocation } from "./types/medicine";

const TRASH_RETENTION_DAYS = 30;

interface ItemRow {
    id: number;
    name: string;
    trade_name: string | null;
    spec: string | null;
    dosage_form: string | null;
    category: string | null;
    quantity: string | null;
    location_id: number;
    expiry_date: string;
    expiry_precision: "day" | "month";
    opened_at: string | null;
    after_opening_expiry: string | null;
    usage_text: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface LocationRow {
    id: number;
    name: string;
    parent_id: number | null;
    sort_order: number;
}

function mapItem(row: ItemRow): MedItem {
    return {
        id: row.id,
        name: row.name,
        tradeName: row.trade_name,
        spec: row.spec,
        dosageForm: row.dosage_form,
        category: row.category,
        quantity: row.quantity,
        locationId: row.location_id,
        expiryDate: row.expiry_date,
        expiryPrecision: row.expiry_precision,
        openedAt: row.opened_at,
        afterOpeningExpiry: row.after_opening_expiry,
        usageText: row.usage_text,
        note: row.note,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    };
}

function mapLocation(row: LocationRow): MedLocation {
    return { id: row.id, name: row.name, parentId: row.parent_id, sortOrder: row.sort_order };
}

// 位置显示名："卧室/药箱"；房间本身没有父级
export function formatLocationName(loc: MedLocation, byId: Map<number, MedLocation>): string {
    if (loc.parentId === null) return loc.name;
    const parent = byId.get(loc.parentId);
    return parent ? `${parent.name}/${loc.name}` : loc.name;
}

export async function getMedLocations(): Promise<MedLocation[]> {
    const { data, error } = await supabase
        .from("med_locations")
        .select("id, name, parent_id, sort_order")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapLocation);
}

export async function createMedLocation(name: string, parentId: number | null): Promise<MedLocation> {
    const { data, error } = await supabase
        .from("med_locations")
        .insert({ name, parent_id: parentId })
        .select("id, name, parent_id, sort_order")
        .single();
    if (error) throw error;
    return mapLocation(data as LocationRow);
}

// 被任何药品（含回收站里的）引用、或下面还有容器时拒绝删除
export async function deleteMedLocation(id: number): Promise<"ok" | "referenced" | "has-children"> {
    const { count: childCount, error: childError } = await supabase
        .from("med_locations")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", id);
    if (childError) throw childError;
    if ((childCount ?? 0) > 0) return "has-children";

    const { count, error: countError } = await supabase
        .from("med_items")
        .select("id", { count: "exact", head: true })
        .eq("location_id", id);
    if (countError) throw countError;
    if ((count ?? 0) > 0) return "referenced";

    const { error } = await supabase.from("med_locations").delete().eq("id", id);
    if (error) throw error;
    return "ok";
}

// 回收站超过 30 天的记录惰性物理删除（列表查询时顺带执行）
async function purgeExpiredTrash(): Promise<void> {
    const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
        .from("med_items")
        .delete()
        .not("deleted_at", "is", null)
        .lt("deleted_at", cutoff);
    if (error) console.error("Failed to purge expired med trash:", error);
}

export async function listMedItems(trash = false): Promise<MedItemWithStatus[]> {
    if (trash) await purgeExpiredTrash();

    let query = supabase.from("med_items").select("*");
    query = trash ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);

    const [{ data, error }, locations] = await Promise.all([query, getMedLocations()]);
    if (error) throw error;

    const byId = new Map(locations.map((l) => [l.id, l]));
    const items = (data ?? []).map((row) => {
        const item = mapItem(row as ItemRow);
        const loc = byId.get(item.locationId);
        return withExpiryStatus(item, loc ? formatLocationName(loc, byId) : "未知位置");
    });

    // 有效效期是两列取小，SQL 不好表达；数据量小，取回后排序
    items.sort((a, b) =>
        trash
            ? (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")
            : a.effectiveExpiry.localeCompare(b.effectiveExpiry)
    );
    return items;
}

export type MedItemInput = {
    name: string;
    tradeName: string | null;
    spec: string | null;
    dosageForm: string | null;
    category: string | null;
    quantity: string | null;
    locationId: number;
    expiryDate: string;
    expiryPrecision: "day" | "month";
    openedAt: string | null;
    afterOpeningExpiry: string | null;
    usageText: string | null;
    note: string | null;
};

function toRow(input: MedItemInput) {
    return {
        name: input.name,
        trade_name: input.tradeName,
        spec: input.spec,
        dosage_form: input.dosageForm,
        category: input.category,
        quantity: input.quantity,
        location_id: input.locationId,
        expiry_date: input.expiryDate,
        expiry_precision: input.expiryPrecision,
        opened_at: input.openedAt,
        after_opening_expiry: input.afterOpeningExpiry,
        usage_text: input.usageText,
        note: input.note,
    };
}

export async function createMedItem(input: MedItemInput): Promise<number> {
    const { data, error } = await supabase.from("med_items").insert(toRow(input)).select("id").single();
    if (error) throw error;
    return data.id as number;
}

export async function updateMedItem(id: number, input: MedItemInput): Promise<boolean> {
    const { data, error } = await supabase
        .from("med_items")
        .update({ ...toRow(input), updated_at: new Date().toISOString() })
        .eq("id", id)
        .is("deleted_at", null)
        .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
}

export async function softDeleteMedItem(id: number): Promise<boolean> {
    const { data, error } = await supabase
        .from("med_items")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .is("deleted_at", null)
        .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
}

export async function restoreMedItem(id: number): Promise<boolean> {
    const { data, error } = await supabase
        .from("med_items")
        .update({ deleted_at: null })
        .eq("id", id)
        .not("deleted_at", "is", null)
        .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
}

export async function purgeMedItem(id: number): Promise<boolean> {
    const { data, error } = await supabase
        .from("med_items")
        .delete()
        .eq("id", id)
        .not("deleted_at", "is", null)
        .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
}

// ---- 贴标 / 二维码 ----

// 已有 token 直接返回；没有则生成 32 位随机串（可撤销，撤销后旧码失效）
export async function ensureQrToken(id: number): Promise<string | null> {
    const { data, error } = await supabase
        .from("med_items")
        .select("qr_token")
        .eq("id", id)
        .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    if (data.qr_token) return data.qr_token as string;

    const token = randomBytes(24).toString("base64url");
    const { error: updateError } = await supabase
        .from("med_items")
        .update({ qr_token: token })
        .eq("id", id)
        .is("qr_token", null);
    if (updateError) throw updateError;
    return token;
}

export async function revokeQrToken(id: number): Promise<boolean> {
    const { data, error } = await supabase
        .from("med_items")
        .update({ qr_token: null })
        .eq("id", id)
        .not("qr_token", "is", null)
        .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
}

// 公开急救卡查询：回收站里的也返回（页面据此提示"已删除"而不是"已失效"）
export async function getMedItemByToken(token: string): Promise<MedItemWithStatus | null> {
    const { data, error } = await supabase
        .from("med_items")
        .select("*")
        .eq("qr_token", token)
        .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const item = mapItem(data as ItemRow);
    const { data: loc } = await supabase
        .from("med_locations")
        .select("id, name, parent_id, sort_order")
        .eq("id", item.locationId)
        .maybeSingle();
    const locations = loc ? [mapLocation(loc as LocationRow)] : [];
    const byId = new Map(locations.map((l) => [l.id, l]));
    const locationName = loc ? formatLocationName(locations[0], byId) : "";
    return withExpiryStatus(item, locationName);
}

// 标签打印页用：按 id 批量取（保持入参顺序），顺带保证每条都有 qr_token
export async function getMedItemsForLabels(ids: number[]): Promise<(MedItemWithStatus & { qrToken: string })[]> {
    if (ids.length === 0) return [];
    const locations = await getMedLocations();
    const byId = new Map(locations.map((l) => [l.id, l]));
    const items: (MedItemWithStatus & { qrToken: string })[] = [];
    for (const id of ids) {
        const token = await ensureQrToken(id);
        if (!token) continue;
        const { data, error } = await supabase
            .from("med_items")
            .select("*")
            .eq("id", id)
            .is("deleted_at", null)
            .maybeSingle();
        if (error) throw error;
        if (!data) continue;
        const item = mapItem(data as ItemRow);
        const loc = byId.get(item.locationId);
        items.push({
            ...withExpiryStatus(item, loc ? formatLocationName(loc, byId) : "未知位置"),
            qrToken: token,
        });
    }
    return items;
}

export function medLabelNo(id: number): string {
    return `M-${String(id).padStart(4, "0")}`;
}
