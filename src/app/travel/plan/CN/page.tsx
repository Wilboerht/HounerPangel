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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center py-16 px-6">
        <div className="max-w-5xl w-full">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            旅行计划（国内）
          </h1>
        </header>

        {/* Simple List */}
        <div className="max-w-2xl mx-auto w-full border-t border-border/40">
          {cnPlans.map((plan) => (
            <Link
              key={plan.slug}
              href={`/travel/plan/CN/${plan.slug}`}
              className="group flex items-center justify-between py-5 border-b border-border/40 hover:bg-muted/5 transition-all px-4 -mx-4 rounded-lg"
            >
              <div className="flex items-center gap-6">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {plan.icon}
                </span>
                <div>
                  <h2 className="text-lg font-medium group-hover:text-primary transition-colors">
                    {plan.title}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider opacity-60">
                    {plan.slug}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
