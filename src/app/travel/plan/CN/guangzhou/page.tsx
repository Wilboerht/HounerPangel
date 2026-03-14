import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { guangzhouPlan } from "@/data/travel/guangzhou";

export const metadata: Metadata = {
  title: `${guangzhouPlan.title} - Hank Wong's Web`,
  description: guangzhouPlan.description,
};

export default function GuangzhouPage() {
  return <TravelPlanTemplate data={guangzhouPlan} />;
}
