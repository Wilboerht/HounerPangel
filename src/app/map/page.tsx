import type { Metadata } from "next";
import { FootprintMap } from "@/components/footprint-map";
import { cities } from "@/data/cities";

export const metadata: Metadata = {
    title: "足迹 - Hank Wong's Web",
    description: "Hank Wong (wilboerht) 走过的城市足迹地图。",
};

export default function Footprints() {
    return (
        <main className="h-dvh w-screen">
            <FootprintMap cities={cities} />
        </main>
    );
}
