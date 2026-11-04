import "server-only";

import { env } from "./env";
import { extractStoragePaths, supabase } from "./supabase";
import { fetchAllPages } from "./supabase-pagination";
import type { MediaAsset, MediaKind } from "./types/media";

function publicMediaUrl(path: string) {
    return `${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/images/${path.split("/").map(encodeURIComponent).join("/")}`;
}

async function referenceCounts() {
    const [posts, revisions] = await Promise.all([
        fetchAllPages(async (from, to) => await supabase
            .from("blog_posts")
            .select("content, cover_image")
            .order("id", { ascending: true })
            .range(from, to)),
        fetchAllPages(async (from, to) => await supabase
            .from("post_revisions")
            .select("content, cover_image")
            .order("id", { ascending: true })
            .range(from, to)),
    ]);
    const counts = new Map<string, number>();
    for (const row of [...posts, ...revisions]) {
        for (const path of extractStoragePaths(`${row.content}\n${row.cover_image ? `![](${row.cover_image})` : ""}`)) counts.set(path, (counts.get(path) ?? 0) + 1);
    }
    return counts;
}

export async function listMediaAssets(): Promise<MediaAsset[]> {
    const [files, assets, references] = await Promise.all([
        fetchAllPages(async (from, to) => await supabase.storage.from("images").list("blog", {
            limit: to - from + 1,
            offset: from,
            sortBy: { column: "name", order: "asc" },
        })),
        fetchAllPages(async (from, to) => await supabase
            .from("media_assets")
            .select("id, path, file_name, kind, mime_type, size, width, height, alt, caption, created_at")
            .order("id", { ascending: true })
            .range(from, to)),
        referenceCounts(),
    ]);

    const metadata = new Map(assets.map((row) => [row.path, row]));
    return files.filter((file) => file.name).map((file) => {
        const path = `blog/${file.name}`;
        const row = metadata.get(path);
        const fileMetadata: Record<string, unknown> = file.metadata ?? {};
        const mimeType = row?.mime_type ?? (fileMetadata.mimetype as string | undefined) ?? "application/octet-stream";
        const kind: MediaKind = row?.kind ?? (mimeType.startsWith("image/") ? "image" : mimeType.startsWith("video/") ? "video" : "attachment");
        return {
            id: row?.id ?? path,
            path,
            fileName: row?.file_name ?? file.name,
            kind,
            mimeType,
            size: row?.size ?? Number(fileMetadata.size ?? 0),
            width: row?.width ?? null,
            height: row?.height ?? null,
            alt: row?.alt ?? "",
            caption: row?.caption ?? "",
            url: publicMediaUrl(path),
            createdAt: row?.created_at ?? file.created_at,
            references: references.get(path) ?? 0,
        };
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function registerMediaAsset(input: {
    path: string;
    fileName: string;
    kind: MediaKind;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
}) {
    const { error } = await supabase.from("media_assets").upsert({
        path: input.path,
        file_name: input.fileName,
        kind: input.kind,
        mime_type: input.mimeType,
        size: input.size,
        width: input.width,
        height: input.height,
    }, { onConflict: "path" });
    if (error) throw error;
}

export async function updateMediaAsset(id: string, alt: string, caption: string) {
    const { error } = await supabase.from("media_assets").update({ alt, caption }).eq("id", id);
    if (error) throw error;
}

export async function deleteMediaAsset(id: string): Promise<"missing" | "in-use" | "deleted"> {
    const isPath = id.startsWith("blog/");
    const { data, error } = isPath
        ? { data: { path: id }, error: null }
        : await supabase.from("media_assets").select("path").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return "missing";

    const references = await referenceCounts();
    if ((references.get(data.path) ?? 0) > 0) return "in-use";

    const { error: storageError } = await supabase.storage.from("images").remove([data.path]);
    if (storageError) throw storageError;
    const { error: deleteError } = await supabase.from("media_assets").delete().eq("path", data.path);
    if (deleteError) throw deleteError;
    return "deleted";
}
