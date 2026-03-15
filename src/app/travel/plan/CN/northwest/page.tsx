import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { northwestPlan } from "@/data/travel/northwest";

export const metadata: Metadata = {
  title: `${northwestPlan.title} - Hank Wong's Web`,
  description: northwestPlan.description,
};

export default function NorthwestPage() {
  return <TravelPlanTemplate data={northwestPlan} />;
}
