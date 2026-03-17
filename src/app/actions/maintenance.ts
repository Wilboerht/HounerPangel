"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Cleanup orphaned media files from Supabase Storage
 * An orphaned file is a file that exists in the 'assets' bucket but is not referenced
 * in any post or research content, and is older than 24 hours.
 */
export async function cleanupOrphanedMedia() {
    try {
        console.log("Starting media cleanup job...");
        
        // 1. Fetch all content from database
        const [{ data: posts }, { data: research }] = await Promise.all([
            supabaseAdmin.from('posts').select('content'),
            supabaseAdmin.from('research').select('content')
        ]);

        const allContent = [
            ...(posts?.map(p => p.content) || []),
            ...(research?.map(r => r.content) || [])
        ].join("\n");

        // 2. Extract all URLs (Markdown and HTML)
        // Match standard markdown ![...] (url) and <img> src="..."
        const urlRegex = /!\[.*?\]\((.*?)\)|src=["'](.*?)["']/g;
        const referencedUrls = new Set<string>();
        let match;
        while ((match = urlRegex.exec(allContent)) !== null) {
            const url = match[1] || match[2];
            if (url) referencedUrls.add(url);
        }

        console.log(`Found ${referencedUrls.size} unique media references in database.`);

        // 3. List all files in 'assets' bucket recursively
        const allFiles: { path: string; created_at: string }[] = [];
        
        async function listFilesRecursive(path: string) {
            const { data, error } = await supabaseAdmin.storage.from('assets').list(path);
            if (error) throw error;

            for (const item of data) {
                const fullPath = path ? `${path}/${item.name}` : item.name;
                if (item.metadata === null || !item.id) { 
                    // It's a directory
                    await listFilesRecursive(fullPath);
                } else {
                    allFiles.push({
                        path: fullPath,
                        created_at: item.created_at || new Date().toISOString()
                    });
                }
            }
        }

        await listFilesRecursive(""); // Start from root
        console.log(`Found ${allFiles.length} total files in storage.`);

        // 4. Identify files to delete
        const now = new Date();
        const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours
        
        const filesToDelete: string[] = [];
        const { data: { publicUrl: baseUrl } } = supabaseAdmin.storage.from('assets').getPublicUrl("dummy");
        const storageBaseUrl = baseUrl.replace("/dummy", "");

        for (const file of allFiles) {
            const fileUrl = `${storageBaseUrl}/${file.path}`;
            const isReferenced = Array.from(referencedUrls).some(ref => ref.includes(file.path));
            const isOldEnough = (now.getTime() - new Date(file.created_at).getTime()) > gracePeriod;

            if (!isReferenced && isOldEnough) {
                filesToDelete.push(file.path);
            }
        }

        // 5. Perform deletion
        if (filesToDelete.length > 0) {
            console.log(`Deleting ${filesToDelete.length} orphaned files...`);
            const { error: deleteError } = await supabaseAdmin.storage.from('assets').remove(filesToDelete);
            if (deleteError) throw deleteError;
            return { success: true, deleted: filesToDelete.length, files: filesToDelete };
        }

        console.log("No orphaned files found for cleanup.");
        return { success: true, deleted: 0 };
    } catch (error: any) {
        console.error("Media cleanup failed:", error);
        return { success: false, error: error.message };
    }
}
