import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { osakaPlan } from "@/data/travel/osaka";

export const metadata: Metadata = {
  title: `${osakaPlan.title} - Hank Wong's Web`,
  description: osakaPlan.description,
};

export default function OsakaPage() {
  return <TravelPlanTemplate data={osakaPlan} />;
}
