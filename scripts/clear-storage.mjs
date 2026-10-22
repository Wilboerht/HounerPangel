// 清空所有 Storage bucket 里的文件（保留 bucket 本身）。
// 必须在 reset.sql 之前运行：API 依赖 storage.objects 记录定位物理文件，
// reset.sql TRUNCATE 之后残留文件将无法再通过 API 删除。
//
// 运行：node --env-file=.env.local scripts/clear-storage.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY（检查 .env.local）");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: buckets, error } = await supabase.storage.listBuckets();
if (error) throw error;

if (buckets.length === 0) {
  console.log("没有 bucket，无需清理");
  process.exit(0);
}

for (const b of buckets) {
  const { error: e } = await supabase.storage.emptyBucket(b.id);
  if (e) {
    console.error(`清空 bucket ${b.id} 失败:`, e.message);
    process.exitCode = 1;
  } else {
    console.log(`已清空 bucket: ${b.id}`);
  }
}
