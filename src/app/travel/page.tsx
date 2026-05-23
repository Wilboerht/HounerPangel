import type { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { Map, ClipboardList, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "旅行 - Hank Wong's Web",
  description: "旅行计划与旅行地图",
};

const travelLinks = [
  {
    href: "/travel/plan",
    icon: ClipboardList,
    title: "旅行计划",
    description: "查看各地的旅行计划与预算",
  },
  {
    href: "/travel/map",
    icon: Map,
    title: "旅行地图",
    description: "探索去过的和想去的地方",
  },
];

export default function TravelPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full space-y-8">
        <nav>
          <BackButton />
        </nav>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            旅行
          </h1>
          <p className="text-lg text-muted">
            旅行计划与旅行地图
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {travelLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-5 p-5 border border-border bg-card hover:border-foreground/30 transition-colors duration-200"
            >
              <div className="flex-shrink-0 p-3 bg-foreground/5 text-muted group-hover:text-foreground transition-colors duration-200">
                <link.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground mb-0.5">
                  {link.title}
                </h2>
                <p className="text-sm text-muted truncate">
                  {link.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
            </Link>
          ))}
        </div>

        <footer className="pt-8 text-sm text-muted border-t border-white/10">
          <p>&copy; {new Date().getFullYear()} wilboerht</p>
        </footer>
      </div>
    </main>
  );
}
