import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { getMedItemsForLabels, medLabelNo } from "@/lib/medicine-db";
import { SITE_URL } from "@/lib/site";
import { LabelsToolbar } from "@/components/admin/labels-toolbar";

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

// 标签打印（PRD 9.3 阶段 1）：固定 60mm × 40mm 黑白模板，浏览器打印或另存 PDF。
// 每张标签含指向免登录急救卡 /q/{token} 的二维码。
export default async function MedicineLabelsPage({ searchParams }: Props) {
  const { ids: idsParam } = await searchParams;
  const ids = (idsParam ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 100);

  const items = await getMedItemsForLabels(ids).catch(() => []);
  const labels = await Promise.all(
    items.map(async (item) => ({
      item,
      qr: await QRCode.toDataURL(`${SITE_URL}/q/${item.qrToken}`, { margin: 0, width: 200 }),
    }))
  );

  return (
    <div className="flex flex-col gap-6">
      {/* @page 只对打印生效；屏幕上是预览网格 */}
      <style>{`
        @page { size: 60mm 40mm; margin: 0; }
        @media print {
          .med-label { margin: 0 !important; border: none !important; page-break-after: always; }
        }
      `}</style>

      <Link
        href="/admin/medicine"
        className="inline-flex items-center gap-2 self-start text-sm text-muted hover:text-foreground transition-colors print:hidden"
      >
        <ArrowLeft className="w-4 h-4" />
        返回药品记录
      </Link>

      {labels.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          没有可打印的药品。回到药品记录，用「贴标」选择药品后再来。
        </p>
      ) : (
        <>
          <LabelsToolbar items={labels.map(({ item }) => ({ id: item.id, name: item.name }))} />

          <div className="flex flex-wrap gap-4">
            {labels.map(({ item, qr }) => (
              <div
                key={item.id}
                className="med-label flex overflow-hidden rounded-md border border-dashed border-border"
                style={{ width: "60mm", height: "40mm", padding: "2.5mm" }}
              >
                <div className="flex min-w-0 flex-1 flex-col justify-between" style={{ gap: "1mm" }}>
                  <div>
                    <p className="font-bold leading-tight text-foreground" style={{ fontSize: "11pt" }}>
                      {item.name}
                      {item.spec && (
                        <span className="ml-1 font-normal text-muted" style={{ fontSize: "8pt" }}>
                          {item.spec}
                        </span>
                      )}
                    </p>
                    {item.usageText && (
                      <p className="leading-tight text-foreground" style={{ fontSize: "9pt" }}>
                        用法：{item.usageText}
                      </p>
                    )}
                  </div>
                  <div className="leading-tight" style={{ fontSize: "8pt" }}>
                    <p className={item.expiryStatus === "expired" ? "font-bold text-red-600" : "text-foreground"}>
                      效期：
                      {item.expiryPrecision === "month"
                        ? item.effectiveExpiry.slice(0, 7)
                        : item.effectiveExpiry}
                    </p>
                    <p className="truncate text-muted">位置：{item.locationName}</p>
                  </div>
                </div>
                <div
                  className="flex flex-shrink-0 flex-col items-center justify-between"
                  style={{ marginLeft: "2mm" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qr}
                    alt=""
                    style={{ width: "20mm", height: "20mm", imageRendering: "pixelated" }}
                  />
                  <p className="text-muted" style={{ fontSize: "7pt" }}>
                    {medLabelNo(item.id)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
