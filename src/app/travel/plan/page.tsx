import type { Metadata } from "next";
import Link from "next/link";
import { cnPlans, jpPlans } from "@/data/travel";

export const metadata: Metadata = {
  title: "旅行计划 - Hank Wong's Web",
  description: "旅行计划及预算",
};

export default function PlanIndexPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            旅行计划
          </h1>
          <p className="text-lg text-muted">
            旅行计划及预算
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* China */}
          <div>
            <h2 className="text-xl font-semibold mb-4">中国</h2>
            <ul className="space-y-2">
              {cnPlans.map((plan) => (
                <li key={plan.slug}>
                  <Link
                    href={`/travel/plan/${plan.slug}`}
                    className="group inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
                  >
                    <span>{plan.icon}</span>
                    <span className="group-hover:underline">
                      {plan.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Asia */}
          <div>
            <h2 className="text-xl font-semibold mb-4">亚洲</h2>
            <ul className="space-y-2">
              {jpPlans.map((plan) => (
                <li key={plan.slug}>
                  <Link
                    href={`/travel/plan/${plan.slug}`}
                    className="group inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
                  >
                    <span>{plan.icon}</span>
                    <span className="group-hover:underline">
                      {plan.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="pt-8 text-sm text-muted border-t border-white/10">
          <p>&copy; {new Date().getFullYear()} wilboerht</p>
        </footer>
      </div>
    </main>
  );
}
