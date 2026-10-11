import { NextRequest, NextResponse } from "next/server";
import { listMedItems } from "@/lib/medicine-db";
import { todayLocal } from "@/lib/medicine";
import { checkAuth } from "@/lib/auth";
import type { ExpiryStatus } from "@/lib/types/medicine";

const STATUS_LABEL: Record<ExpiryStatus, string> = {
    expired: "已过期",
    expiring: "临期",
    ok: "正常",
};

const HEADERS = [
    "名称", "商品名", "规格", "剂型", "类别", "数量", "位置",
    "原效期", "效期精度", "开封日期", "开封后效期", "有效效期", "效期状态",
    "用法", "备注", "录入时间",
];

function csvCell(value: string | null | undefined): string {
    const s = value ?? "";
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const items = await listMedItems(false);
        const rows = items.map((item) =>
            [
                item.name,
                item.tradeName,
                item.spec,
                item.dosageForm,
                item.category,
                item.quantity,
                item.locationName,
                item.expiryDate,
                item.expiryPrecision === "month" ? "月" : "日",
                item.openedAt,
                item.afterOpeningExpiry,
                item.effectiveExpiry,
                STATUS_LABEL[item.expiryStatus],
                item.usageText,
                item.note,
                item.createdAt.slice(0, 10),
            ].map(csvCell).join(",")
        );

        // BOM 让 Excel 正确识别 UTF-8 中文
        const csv = "﻿" + [HEADERS.join(","), ...rows].join("\r\n");
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="medicine-${todayLocal()}.csv"`,
            },
        });
    } catch (error) {
        console.error("Failed to export med items:", error);
        return NextResponse.json({ error: "导出失败" }, { status: 500 });
    }
}
