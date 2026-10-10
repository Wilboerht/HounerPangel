import { AdminGuard } from "@/lib/admin-guard";
import { BlogAdminClient } from "@/components/admin/blog-admin-client";

export default function AdminBlogPage() {
  return (
    <AdminGuard>
      <BlogAdminClient />
    </AdminGuard>
  );
}
