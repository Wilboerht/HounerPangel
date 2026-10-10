import { BlogEditClient } from "@/components/admin/blog-edit-client";

interface EditBlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { slug } = await params;
  return <BlogEditClient slug={slug} />;
}
