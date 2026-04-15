'use server';

import {
    addComment,
    getComments,
    incrementViews,
    submitFeedback,
} from '@/lib/supabase';
import type { Comment } from '@/types/content';

export async function fetchCommentsAction(pageId: string): Promise<Comment[]> {
    return getComments(pageId);
}

export async function addCommentAction(
    pageId: string,
    text: string,
    nickname?: string,
    email?: string
): Promise<boolean> {
    const result = await addComment(pageId, text, nickname, email);
    return !!result;
}

export async function submitFeedbackAction(
    articleTitle: string,
    userMessage: string
): Promise<boolean> {
    const result = await submitFeedback(articleTitle, userMessage);
    return !!result;
}

export async function incrementViewsAction(
    slug: string,
    type: 'posts' | 'research'
): Promise<void> {
    await incrementViews(slug, type);
}
