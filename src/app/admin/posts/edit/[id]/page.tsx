import PostEditor from "@/components/PostEditor";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !post) {
        notFound();
    }

    return <PostEditor initialData={post} />;
}
