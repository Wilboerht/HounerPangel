import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { tokyoPlan } from "@/data/travel/tokyo";

export const metadata: Metadata = {
  title: `${tokyoPlan.title} - Hank Wong's Web`,
  description: tokyoPlan.description,
};

export default function TokyoPage() {
  return <TravelPlanTemplate data={tokyoPlan} />;
}
