// 清空所有 Storage bucket 里的文件（保留 bucket 本身）。
// 必须在 reset.sql 之前运行：API 依赖 storage.objects 记录定位物理文件，
// reset.sql TRUNCATE 之后残留文件将无法再通过 API 删除。
//
// 运行：npm run clear:storage -- --yes
// （等价于 node --env-file=.env.local scripts/clear-storage.mjs --yes）
// 不带 --yes 时只列出将受影响的 bucket，不做任何删除。

import { createClient } from "@supabase/supabase-js";

const assumeYes = process.argv.includes("--yes");

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
if (error) {
  console.error("列出 bucket 失败:", error.message);
  process.exit(1);
}

if (buckets.length === 0) {
  console.log("没有 bucket，无需清理");
  process.exit(0);
}

if (!assumeYes) {
  console.log("将清空以下 bucket 内的全部文件（不可恢复）：");
  for (const b of buckets) console.log(`  - ${b.id}`);
  console.log("\n确认执行请追加 --yes 参数：npm run clear:storage -- --yes");
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
