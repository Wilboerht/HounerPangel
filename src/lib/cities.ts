import "server-only";

import { supabase } from "./supabase";
import { fetchAllPages } from "./supabase-pagination";
import type { City } from "@/data/cities";

export interface ManagedCity extends City {
    id: string;
    updatedAt: string;
}

export type CityInput = {
    name: string;
    coordinates: [number, number];
    status: "visited" | "planned";
    visitDate: string | null;
    note: string | null;
};

function mapCity(row: Record<string, unknown>): ManagedCity {
    return {
        id: row.id as string,
        name: row.name as string,
        coordinates: [row.longitude as number, row.latitude as number],
        status: row.status as "visited" | "planned",
        visitDate: (row.visit_date as string | null) ?? undefined,
        note: (row.note as string | null) ?? undefined,
        updatedAt: row.updated_at as string,
    };
}

function values(input: CityInput) {
    return {
        name: input.name,
        longitude: input.coordinates[0],
        latitude: input.coordinates[1],
        status: input.status,
        visit_date: input.visitDate,
        note: input.note,
    };
}

export async function getCities(): Promise<ManagedCity[]> {
    const data = await fetchAllPages(async (from, to) => await supabase
        .from("cities")
        .select("id, name, longitude, latitude, status, visit_date, note, updated_at")
        .order("name", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to));
    return data.map((row) => mapCity(row));
}

export async function createCity(input: CityInput): Promise<void> {
    const { error } = await supabase.from("cities").insert(values(input));
    if (error) throw error;
}

export async function updateCity(id: string, input: CityInput, expectedUpdatedAt: string): Promise<boolean> {
    const { data, error } = await supabase.from("cities").update(values(input)).eq("id", id).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (error) throw error;
    return data !== null;
}

export async function deleteCity(id: string, expectedUpdatedAt: string): Promise<boolean> {
    const { data, error } = await supabase.from("cities").delete().eq("id", id).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (error) throw error;
    return data !== null;
}

export async function importCities(inputs: CityInput[]): Promise<void> {
    const { error } = await supabase.from("cities").upsert(inputs.map(values), { onConflict: "name" });
    if (error) throw error;
}
