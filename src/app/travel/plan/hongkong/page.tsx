import type { Metadata } from "next";
import TravelPlanTemplate from "@/components/travel/TravelPlanTemplate";
import { hongkongPlan } from "@/data/travel/hongkong";

export const metadata: Metadata = {
  title: `${hongkongPlan.title} - Hank Wong's Web`,
  description: hongkongPlan.description,
};

export default function HongkongPage() {
  return <TravelPlanTemplate data={hongkongPlan} />;
}
