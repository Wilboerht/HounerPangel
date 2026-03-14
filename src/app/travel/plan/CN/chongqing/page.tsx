import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { chongqingPlan } from "@/data/travel/chongqing";

export const metadata: Metadata = {
  title: `${chongqingPlan.title} - Hank Wong's Web`,
  description: chongqingPlan.description,
};

export default function ChongqingPage() {
  return <TravelPlanTemplate data={chongqingPlan} />;
}
