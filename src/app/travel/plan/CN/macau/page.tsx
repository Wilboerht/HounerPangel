import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { macauPlan } from "@/data/travel/macau";

export const metadata: Metadata = {
  title: `${macauPlan.title} - Hank Wong's Web`,
  description: macauPlan.description,
};

export default function MacauPage() {
  return <TravelPlanTemplate data={macauPlan} />;
}
