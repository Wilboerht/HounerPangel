import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { beijingPlan } from "@/data/travel/beijing";

export const metadata: Metadata = {
  title: `${beijingPlan.title} - Hank Wong's Web`,
  description: beijingPlan.description,
};

export default function BeijingPage() {
  return <TravelPlanTemplate data={beijingPlan} />;
}
