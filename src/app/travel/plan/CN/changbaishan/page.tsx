import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { changbaishanPlan } from "@/data/travel/changbaishan";

export const metadata: Metadata = {
  title: `${changbaishanPlan.title} - Hank Wong's Web`,
  description: changbaishanPlan.description,
};

export default function ChangbaishanPage() {
  return <TravelPlanTemplate data={changbaishanPlan} />;
}
