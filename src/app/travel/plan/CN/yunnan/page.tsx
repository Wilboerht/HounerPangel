import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { yunnanPlan } from "@/data/travel/yunnan";

export const metadata: Metadata = {
  title: `${yunnanPlan.title} - Hank Wong's Web`,
  description: yunnanPlan.description,
};

export default function YunnanPage() {
  return <TravelPlanTemplate data={yunnanPlan} />;
}
