import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { cnPlans, jpPlans } from "@/data/travel";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const allPlans = [...cnPlans, ...jpPlans];
  const plan = allPlans.find((p) => p.slug === slug);

  if (!plan) {
    return {
      title: "Not Found",
      description: "旅行计划不存在",
    };
  }

  return {
    title: `${plan.title} - Hank Wong's Web`,
    description: plan.description,
  };
}

export async function generateStaticParams() {
  const allPlans = [...cnPlans, ...jpPlans];
  return allPlans.map((plan) => ({
    slug: plan.slug,
  }));
}

export default async function PlanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allPlans = [...cnPlans, ...jpPlans];
  const plan = allPlans.find((p) => p.slug === slug);

  if (!plan) {
    notFound();
  }

  return <TravelPlanTemplate data={plan} />;
}
