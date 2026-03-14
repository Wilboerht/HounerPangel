import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { nanjingPlan } from "@/data/travel/nanjing";

export const metadata: Metadata = {
  title: `${nanjingPlan.title} - Hank Wong's Web`,
  description: nanjingPlan.description,
};

export default function NanjingPage() {
  return <TravelPlanTemplate data={nanjingPlan} />;
}