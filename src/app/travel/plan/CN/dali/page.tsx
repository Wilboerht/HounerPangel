import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { daliPlan } from "@/data/travel/dali";

export const metadata: Metadata = {
  title: `${daliPlan.title} - Hank Wong's Web`,
  description: daliPlan.description,
};

export default function DaliPage() {
  return <TravelPlanTemplate data={daliPlan} />;
}
