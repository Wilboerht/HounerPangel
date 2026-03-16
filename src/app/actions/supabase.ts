"use server";

import { 
    incrementViews, 
    submitFeedback, 
    getComments, 
    addComment 
} from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function incrementViewsAction(slug: string, type: 'posts' | 'research') {
    await incrementViews(slug, type);
}

export async function submitFeedbackAction(articleTitle: string, userMessage: string) {
    const res = await submitFeedback(articleTitle, userMessage);
    return res ? true : false;
}

export async function fetchCommentsAction(pageId: string) {
    return await getComments(pageId);
}

export async function addCommentAction(pageId: string, text: string, nickname?: string, email?: string) {
    const res = await addComment(pageId, text, nickname, email);
    revalidatePath(`/blog`);
    revalidatePath(`/blog/${pageId}`);
    return res ? true : false;
}
