import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { shenzhenPlan } from "@/data/travel/shenzhen";

export const metadata: Metadata = {
  title: `${shenzhenPlan.title} - Hank Wong's Web`,
  description: shenzhenPlan.description,
};

export default function ShenzhenPage() {
  return <TravelPlanTemplate data={shenzhenPlan} />;
}
