import type { Metadata } from "next";
import Link from "next/link";
import { jpPlans } from "@/data/travel";

export const metadata: Metadata = {
  title: "旅行计划（日本） - Hank Wong's Web",
  description: "探索日本各大城市的深度旅行计划，包含详细行程、美食推荐及避坑指南。",
};

export default function JPPlanIndexPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center py-16 px-6">
        <div className="max-w-5xl w-full">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            旅行计划（日本）
          </h1>
        </header>

        {/* Grid */}
        <div className="flex flex-wrap justify-center gap-4">
          {jpPlans.map((plan) => (
            <Link
              key={plan.slug}
              href={`/travel/plan/JP/${plan.slug}`}
              className="group relative w-40 sm:w-48 md:w-56 aspect-square flex flex-col items-center justify-center p-4 rounded-[2.5rem] border border-border/50 bg-muted/5 hover:bg-muted/10 transition-all duration-500 hover:scale-[1.02] active:scale-95 overflow-hidden"
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
    </div>
  );
}
