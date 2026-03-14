import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { yangzhouPlan } from "@/data/travel/yangzhou";

export const metadata: Metadata = {
  title: `${yangzhouPlan.title} - Hank Wong's Web`,
  description: yangzhouPlan.description,
};

export default function YangzhouPage() {
  return <TravelPlanTemplate data={yangzhouPlan} />;
}
