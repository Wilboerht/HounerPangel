import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { japanFullPlan } from "@/data/travel/japan-full";

export const metadata: Metadata = {
  title: `${japanFullPlan.title} - Hank Wong's Web`,
  description: japanFullPlan.description,
};

export default function JapanFullPage() {
  return <TravelPlanTemplate data={japanFullPlan} />;
}
