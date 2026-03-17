"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function savePostAction(postData: any) {
    const { id, ...data } = postData;
    
    try {
        if (id) {
            // Update
            const { error } = await supabaseAdmin.from('posts').update(data).eq('id', id);
            if (error) throw error;
        } else {
            // Insert
            const { error } = await supabaseAdmin.from('posts').insert([data]);
            if (error) throw error;
        }
        
        revalidatePath("/admin/posts");
        revalidatePath("/blog");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function saveResearchAction(researchData: any) {
    const { id, ...data } = researchData;
    
    try {
        if (id) {
            // Update
            const { error } = await supabaseAdmin.from('research').update(data).eq('id', id);
            if (error) throw error;
        } else {
            // Insert
            const { error } = await supabaseAdmin.from('research').insert([data]);
            if (error) throw error;
        }
        
        revalidatePath("/admin/research");
        revalidatePath("/research");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function uploadMediaAction(formData: FormData) {
    const file = formData.get("file") as File;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as string; // 'articles' or 'research'

    if (!file || !slug) return { error: "Missing file or slug" };

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${type}/${slug}/${fileName}`;

    try {
        const { data, error } = await supabase.storage
            .from('assets')
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(filePath);

        return { url: publicUrl };
    } catch (error: any) {
        return { error: error.message };
    }
}
