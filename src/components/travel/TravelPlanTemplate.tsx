"use client";

import { MapPin, Calendar, Wallet, Train, Utensils, Ticket, Check, LucideIcon } from "lucide-react";
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
    <main className="min-h-screen px-6 pt-12 pb-0 max-w-4xl mx-auto relative">
      {/* Floating TOC */}
      <aside className="hidden lg:block fixed top-[182px] left-[calc(50%+468px)] w-48 xl:w-56">
        <nav className="flex flex-col gap-3 text-sm border-l border-border pl-4">
          <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2 whitespace-nowrap">目录索引</p>
          <a href="#budget" className="text-muted-foreground hover:text-primary transition-all whitespace-nowrap flex items-center gap-2 font-medium">📦 预算明细</a>
          <a href="#route" className="text-muted-foreground hover:text-primary transition-all whitespace-nowrap flex items-center gap-2 font-medium">🗺️ 行程路线图</a>
          <a href="#itinerary" className="text-muted-foreground hover:text-primary transition-all whitespace-nowrap flex items-center gap-2 font-medium">📅 每日详细行程</a>
          <div className="flex flex-col gap-2.5 pl-4 border-l border-border/40 ml-1">
            {data.itinerary.map((day) => (
              <a key={day.day} href={`#day${day.day}`} className="text-muted-foreground/60 hover:text-primary transition-all text-sm whitespace-nowrap">
                Day {day.day} {day.tocTitle}
              </a>
            ))}
          </div>
          <a href="#attractions" className="text-muted-foreground hover:text-primary transition-all whitespace-nowrap flex items-center gap-2 font-medium">🏛️ 景点汇总</a>
          <a href="#food" className="text-muted-foreground hover:text-primary transition-all whitespace-nowrap flex items-center gap-2 font-medium">🍜 本地美食</a>
          {data.bankTasks && (
            <a href="#banking" className="text-muted-foreground hover:text-primary transition-all whitespace-nowrap flex items-center gap-2 font-medium">🏦 银行开户</a>
          )}
          <a href="#summary" className="text-muted-foreground hover:text-primary transition-all whitespace-nowrap flex items-center gap-2 font-medium">💰 费用总结</a>
        </nav>
      </aside>

      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">
          {data.icon} {data.title}
        </h1>
        <p className="text-muted text-sm font-mono uppercase tracking-widest">
          {data.subtitle}
        </p>
      </header>

      {/* Budget Overview */}
      <section id="budget" className="mb-12 scroll-mt-20">
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

      {/* Route Map (Simplified representation as list) */}
      <section id="route" className="mb-12 scroll-mt-20">
        <h2 className="text-2xl font-semibold mb-6">🗺️ 行程路线图</h2>
        <div className="bg-muted/10 border border-border rounded-lg p-6">
          <div className="flex flex-col items-center gap-2 text-sm">
            {data.itinerary.map((day, idx) => (
              <div key={day.day} className="flex flex-col items-center gap-2">
                <div className="text-center">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Day {day.day}</span>
                </div>
                <div className="text-center text-muted">{day.route}</div>
                {idx < data.itinerary.length - 1 && <span className="text-muted">↓</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Itinerary */}
      <section id="itinerary" className="space-y-12 scroll-mt-20">
        <h2 className="text-2xl font-semibold">📅 每日详细行程</h2>
        {data.itinerary.map((day) => (
          <article key={day.day} id={`day${day.day}`} className="border border-border rounded-lg p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-semibold">Day {day.day}</h3>
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
      <section id="attractions" className="mt-12 scroll-mt-20">
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
      <section id="food" className="mt-12 scroll-mt-20">
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

      {/* Food Footer Note */}
      <section className="mt-8 text-center">
        <p className="text-sm text-muted">※ 以上价格为单人均价，根据实际存在浮动</p>
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
            💡 <strong>避坑提示：</strong> 务必在香港境内连接本地网络操作；出入境记录需为 PDF 格式且不得改名；汇丰扫描证件时建议寻找纯色背景以提高识别率。
          </div>
        </section>
      )}

      {/* Total Budget Summary */}
      <section id="summary" className="mt-12 scroll-mt-20">
        <h2 className="text-2xl font-semibold mb-6">💰 费用总结</h2>
        <div className="bg-muted/10 border border-border rounded-2xl p-6 mb-6 text-center">
          <div className="text-sm text-muted mb-1">预计总花费（含机动/高性价比）</div>
          <div className="text-4xl font-bold">{data.summary.total}</div>
          <div className="text-sm text-muted mt-2">{data.summary.note}</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {data.summary.details.map((detail, idx) => {
            const Icon = IconMap[detail.icon];
            return (
              <div key={idx} className="bg-muted/5 border border-border rounded-xl p-3 text-center">
                {Icon && <Icon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />}
                <div className="text-lg font-semibold">{detail.value}</div>
                <div className="text-xs text-muted">{detail.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-border text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} wilboerht. All rights reserved.</p>
      </footer>
    </main>
  );
}
