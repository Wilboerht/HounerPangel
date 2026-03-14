import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { kyotoPlan } from "@/data/travel/kyoto";

export const metadata: Metadata = {
  title: `${kyotoPlan.title} - Hank Wong's Web`,
  description: kyotoPlan.description,
};

export default function KyotoPage() {
  return <TravelPlanTemplate data={kyotoPlan} />;
}
