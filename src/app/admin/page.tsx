import { LayoutGrid } from "lucide-react";
import * as motion from "framer-motion/client";
import { getPendingTaskCount } from "@/lib/supabase";

export default async function AdminDashboard() {
    // Dynamic greeting and stats
    const [pendingCount] = await Promise.all([
        getPendingTaskCount()
    ]);
    
    const hour = new Date().getHours();
    const greeting = hour < 6 ? "凌晨好" : hour < 11 ? "早上好" : hour < 13 ? "中午好" : hour < 18 ? "下午好" : "晚上好";

    return (
        <div className="flex flex-col min-h-[calc(100vh-180px)]">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
            >
                <div>
                    <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
                        {greeting}, <span className="text-zinc-400 font-medium">管理员</span>
                    </h2>
                    <div className="flex items-center gap-2.5">
                        <div className="w-[3px] h-3.5 bg-indigo-500 rounded-full" />
                        <p className="text-zinc-500 text-sm font-medium">
                            {pendingCount > 0 ? (
                                <>
                                    当前有 <span className="text-indigo-600 font-bold">{pendingCount}</span> 件代办待处理
                                </>
                            ) : (
                                "暂无代办事项"
                            )}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Placeholder for future modules */}
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-[40px] bg-zinc-50/10 min-h-[300px]">
                <LayoutGrid className="w-10 h-10 text-zinc-200 mb-6" strokeWidth={1.5} />
                <p className="text-zinc-400 text-sm font-bold tracking-[0.3em] pl-[0.3em]">即将上线</p>
            </div>
        </div>
    );
}
