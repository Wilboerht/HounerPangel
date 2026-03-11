"use server";

import { incrementViews, submitFeedback, getComments, addComment } from "@/lib/notion";
import { revalidatePath } from "next/cache";

export async function incrementViewsAction(pageId: string) {
    const views = await incrementViews(pageId);
    return views;
}

export async function submitFeedbackAction(articleTitle: string, userMessage: string) {
    const res = await submitFeedback(articleTitle, userMessage);
    return res ? true : false;
}

export async function fetchCommentsAction(pageId: string) {
    return await getComments(pageId);
}

export async function addCommentAction(pageId: string, text: string) {
    const res = await addComment(pageId, text);
    revalidatePath(`/blog`);
    return res ? true : false;
}
