import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { chengduPlan } from "@/data/travel/chengdu";

export const metadata: Metadata = {
  title: `${chengduPlan.title} - Hank Wong's Web`,
  description: chengduPlan.description,
};

export default function ChengduPage() {
  return <TravelPlanTemplate data={chengduPlan} />;
}
