"use client";

import { MapPin, Calendar, Wallet, Train, Utensils, Ticket, Check, ArrowLeft, LucideIcon } from "lucide-react";
import Link from "next/link";
import { TravelPlan } from "@/types/travel";

const IconMap: Record<string, LucideIcon> = {
  Train,
  MapPin,
  Calendar,
  Ticket,
  Utensils,
  Wallet,
};

interface Props {
  data: TravelPlan;
}

export default function TravelPlanTemplate({ data }: Props) {
  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      {/* Header with Back Link */}
      <header className="mb-12">
        <Link 
          href={`/travel/plan/${data.countryCode || 'CN'}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          返回
        </Link>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {data.icon} {data.title}
          </h1>
          <p className="text-muted text-sm">{data.subtitle}</p>
        </div>
      </header>

      {/* Budget Overview */}
      <section id="budget" className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">📦 预算明细</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4">项目</th>
                <th className="text-left py-2 pr-4">预算区间</th>
                <th className="text-left py-2">说明</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {data.budget.map((item, idx) => (
                <tr key={idx} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4">{item.name}</td>
                  <td className="py-2 pr-4">{item.range}</td>
                  <td className="py-2">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Route Map - Simplified */}
      <section id="route" className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">🗺️ 行程路线</h2>
        <div className="text-center text-sm text-muted space-y-1">
          {data.itinerary.map((day, idx) => (
            <div key={day.day}>
              <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">Line {day.day}</span>
              <span className="mx-2 text-muted">{day.route}</span>
              {idx < data.itinerary.length - 1 && <div className="text-muted opacity-50">↓</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Daily Itinerary */}
      <section id="itinerary" className="space-y-12 scroll-mt-20">
        <h2 className="text-2xl font-semibold">📅 详细行程</h2>
        {data.itinerary.map((day) => (
          <article key={day.day} id={`day${day.day}`} className="border border-border rounded-lg p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-semibold">Line {day.day}</h3>
              <span className="text-muted text-sm">{day.title}</span>
            </div>
            <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
              {day.events.map((event, idx) => {
                const Icon = event.type ? IconMap[event.type === 'location' ? 'MapPin' : event.type === 'food' ? 'Utensils' : event.type === 'transport' ? 'Train' : 'Calendar'] : null;
                return (
                  <div key={idx} className="contents">
                    <dt className="text-muted font-medium">{event.time}</dt>
                    <dd className="flex items-start gap-1">
                      {Icon && <Icon className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" />}
                      {event.content}
                    </dd>
                  </div>
                );
              })}
            </dl>
            {day.daySummary && (
              <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
                {day.daySummary}
              </div>
            )}
          </article>
        ))}
      </section>

      {/* Attractions */}
      <section id="attractions" className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">🏛️ 景点汇总</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4">景点</th>
                <th className="text-left py-2 pr-4">位置</th>
                <th className="text-left py-2">简介</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {data.attractions.map((attr, idx) => (
                <tr key={idx} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4">{attr.name}</td>
                  <td className="py-2 pr-4">{attr.location}</td>
                  <td className="py-2">{attr.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Food Recommendations */}
      <section id="food" className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">🍜 本地美食</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">美食类型</th>
                <th className="text-left py-3 px-4 font-semibold">店铺</th>
                <th className="text-left py-3 px-4 font-semibold">位置</th>
                <th className="text-left py-3 px-4 font-semibold">价格</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {data.foods.map((food, idx) => (
                <tr key={idx} className="border-b border-border/50 last:border-0">
                  {food.rowSpan ? (
                    <td className="py-3 px-4" rowSpan={food.rowSpan}>{food.type}</td>
                  ) : (
                    /* Check if previous item had rowSpan to decide whether to render this cell */
                    !data.foods.slice(0, idx).reverse().find(f => f.rowSpan && data.foods.indexOf(f) + f.rowSpan > idx) && (
                      <td className="py-3 px-4">{food.type}</td>
                    )
                  )}
                  <td className="py-3 px-4">{food.name}</td>
                  <td className="py-3 px-4">{food.location}</td>
                  <td className="py-3 px-4">{food.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Banking Section */}
      {data.bankTasks && (
        <section id="banking" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-semibold mb-6">🏦 银行开户指南</h2>
          <div className="space-y-6">
            {data.bankTasks.map((task, idx) => (
              <div key={idx} className="border border-border rounded-xl p-6 bg-muted/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  {task.bank}
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">申请步骤</h4>
                    <ol className="space-y-2 text-sm text-muted">
                      {task.steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex gap-2">
                          <span className="text-primary/60 font-mono">{sIdx + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">必备材料</h4>
                    <ul className="space-y-2 text-sm text-muted">
                      {task.docs.map((doc, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-border" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted leading-relaxed">
            💡 <strong>注意事项：</strong> 需在香港境内连接本地网络；出入境记录需为 PDF 格式且不得改名；汇丰扫描证件时建议寻找纯色背景。
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-border text-center text-xs text-muted">
        <p>&copy; {new Date().getFullYear()} wilboerht</p>
      </footer>
    </main>
  );
}
