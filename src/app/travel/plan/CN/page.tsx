import type { Metadata } from "next";
import Link from "next/link";
import { cnPlans } from "@/data/travel";
import { MapPin, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "旅行计划（国内） - Hank Wong's Web",
  description: "探索中国各大城市的深度旅行计划，包含详细行程、美食推荐及避坑指南。",
};

export default function CNPlanIndexPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            旅行计划（国内）
          </h1>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cnPlans.map((plan) => (
            <Link
              key={plan.slug}
              href={`/travel/plan/CN/${plan.slug}`}
              className="group relative aspect-square flex flex-col items-center justify-center p-4 rounded-3xl border border-border/50 bg-muted/5 hover:bg-muted/10 transition-all duration-500 hover:scale-[1.02] active:scale-95 overflow-hidden"
            >
              {/* Background Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-500 ease-out z-10">
                {plan.icon}
              </span>

              <h2 className="text-sm font-medium text-muted group-hover:text-foreground transition-colors duration-300 z-10 text-center px-2">
                {plan.title.replace("旅行计划", "").trim()}
              </h2>

              {/* Minimalist Path Hint */}
              <div className="absolute bottom-3 text-[8px] font-mono text-muted-foreground/30 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                {plan.slug}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t border-border/40 text-center">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} wilboerht
          </p>
        </footer>
      </div>
    </div>
  );
}
