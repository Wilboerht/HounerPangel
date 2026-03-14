import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { kumamotoPlan } from "@/data/travel/kumamoto";

export const metadata: Metadata = {
  title: `${kumamotoPlan.title} - Hank Wong's Web`,
  description: kumamotoPlan.description,
};

export default function KumamotoPage() {
  return <TravelPlanTemplate data={kumamotoPlan} />;
}
