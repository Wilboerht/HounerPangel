import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { datongPlan } from "@/data/travel/datong";

export const metadata: Metadata = {
  title: `${datongPlan.title} - Hank Wong's Web`,
  description: datongPlan.description,
};

export default function DatongPage() {
  return <TravelPlanTemplate data={datongPlan} />;
}
