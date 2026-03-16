"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// --- DELETE LOGIC WITH STORAGE CLEANUP ---
export async function deletePostAction(id: string, slug: string) {
    try {
        // 1. First, delete associated files in storage
        // Assuming bucket name is 'assets'
        const { data: files } = await supabase.storage.from('assets').list(`articles/${slug}`);
        
        if (files && files.length > 0) {
            const filesToDelete = files.map(file => `articles/${slug}/${file.name}`);
            await supabase.storage.from('assets').remove(filesToDelete);
        }

        // 2. Delete the database record
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;

        revalidatePath("/admin/posts");
        revalidatePath("/blog");
        return { success: true };
    } catch (error: any) {
        console.error("Delete failed:", error);
        return { error: error.message };
    }
}

// Same for Research
export async function deleteResearchAction(id: string, slug: string) {
    try {
        const { data: files } = await supabase.storage.from('assets').list(`research/${slug}`);
        
        if (files && files.length > 0) {
            const filesToDelete = files.map(file => `research/${slug}/${file.name}`);
            await supabase.storage.from('assets').remove(filesToDelete);
        }

        const { error } = await supabase.from('research').delete().eq('id', id);
        if (error) throw error;

        revalidatePath("/admin/research");
        revalidatePath("/research");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
