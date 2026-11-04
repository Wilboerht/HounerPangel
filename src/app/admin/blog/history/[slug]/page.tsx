import { BlogRevisionsClient } from "@/components/admin/blog-revisions-client";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function BlogHistoryPage({ params }: Props) {
    const { slug } = await params;
    return <BlogRevisionsClient slug={slug} />;
}
