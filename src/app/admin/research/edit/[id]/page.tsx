import ResearchEditor from "@/components/ResearchEditor";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface EditResearchPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditResearchPage({ params }: EditResearchPageProps) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { data: research, error } = await supabase
        .from('research')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !research) {
        notFound();
    }

    return <ResearchEditor initialData={research} />;
}
