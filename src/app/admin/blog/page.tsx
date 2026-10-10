import { Suspense } from "react";
import { BlogAdminClient } from "@/components/admin/blog-admin-client";

export default function AdminBlogPage() {
  return (
    <Suspense>
      <BlogAdminClient />
    </Suspense>
  );
}
