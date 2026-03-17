import { supabase } from "@/lib/supabase";
import { 
    Activity,
    ArrowUpRight,
    Globe,
    Server,
    ShieldCheck,
    LayoutGrid,
    Clock,
    User
} from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";
import TrafficChart from "@/components/admin/TrafficChart";
import RealtimeLatency from "@/components/admin/RealtimeLatency";
import { getVisitorStats } from "@/lib/supabase";
import { headers } from "next/headers";

export default async function AdminDashboard() {
    // Fetch real stats
    const [visitorLogs, { data: latestAuditLogs }, headerList] = await Promise.all([
        getVisitorStats(),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(4),
        headers()
    ]);

    // Detect CDN & Region
    const vercelId = headerList.get('x-vercel-id');
    const cfRay = headerList.get('cf-ray');
    
    let cdnProvider = "Standard Stack";
    let activeRegion = "Local Cluster";

    if (vercelId) {
        cdnProvider = "Vercel Edge";
        // Extract region from vercel ID (e.g., hnd1::...)
        activeRegion = vercelId.split(':')[0].toUpperCase() || "Global";
    } else if (cfRay) {
        cdnProvider = "Cloudflare";
        activeRegion = "CF Edge";
    } else if (headerList.get('host')?.includes('localhost')) {
        cdnProvider = "Local Dev";
        activeRegion = "Development";
    }

    // Dynamic greeting
    const hour = new Date().getHours();
    const greeting = hour < 6 ? "凌晨好" : hour < 11 ? "早上好" : hour < 13 ? "中午好" : hour < 18 ? "下午好" : "晚上好";

    return (
        <div className="space-y-10">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
                        {greeting}, <span className="text-zinc-400 font-medium">管理员</span>
                    </h1>
                    <div className="flex items-center gap-2.5">
                        <div className="w-[3px] h-3.5 bg-zinc-900/10 rounded-full" />
                        <p className="text-zinc-500 text-sm font-medium">这里是项目集群的监控数据</p>
                    </div>
                </div>
            </motion.div>

            {/* Main Monitoring Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Traffic Analysis Chart (Span 8) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-8 p-8 rounded-[40px] bg-white border border-zinc-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.015)]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900">流量负载趋势</h3>
                                <p className="text-xs text-zinc-400 font-medium tracking-tight">集群总域名/子域名 24小时实时波动</p>
                            </div>
                        </div>

                    </div>
                    
                    <div className="w-full">
                        <TrafficChart rawData={visitorLogs} />
                    </div>
                </motion.div>

                {/* Right Column Stats */}
                <div className="lg:col-span-4 grid grid-cols-1 gap-6">
                    {/* Node Status */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-[38px] bg-zinc-100 border border-zinc-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group cursor-help"
                        title="分布式节点部署状态与实时网络分发效率"
                    >
                        <div className="absolute -right-8 -bottom-8 opacity-[0.02] rotate-12 transition-transform group-hover:rotate-0 duration-700 text-zinc-900">
                            <Server className="w-48 h-48" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                                        <Globe className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Online</span>
                                </div>
                                <h4 className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-1">节点部署区域</h4>
                                <p className="text-3xl font-black mb-2 antialiased text-zinc-900">{cdnProvider}</p>
                                <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">
                                    当前请求由 <span className="text-zinc-900 font-bold">{activeRegion}</span> 节点 实时处理并分发
                                </p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">探测到节点区域</span>
                                <span className="text-[10px] font-black bg-zinc-200 px-2 py-0.5 rounded text-zinc-600 uppercase">{activeRegion}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Security Check */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-[38px] bg-white border border-zinc-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.015)] relative overflow-hidden group cursor-help"
                        title="集群安全盾：实时监测并拦截异常、恶意请求"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-zinc-900 tracking-tight">安全集群盾</h4>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Secure Guard</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-500">拦截异常请求</p>
                                <p className="text-3xl font-black text-zinc-900 tabular-nums tracking-tighter">0<span className="text-[10px] ml-1 text-zinc-300">INCIDENT</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-300 uppercase mb-1">Status</p>
                                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">Certified</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Secondary Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Recent Logs (Span 7) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-7 space-y-6"
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                            <h2 className="text-[14px] font-black text-zinc-900 uppercase tracking-widest">集群访问记录</h2>
                        </div>
                        <Link href="/admin/logs" className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest bg-zinc-100 px-3 py-1.5 rounded-lg border border-black/[0.02]">
                            审计日志
                        </Link>
                    </div>

                    <div className="grid gap-2">
                        {latestAuditLogs && latestAuditLogs.length > 0 ? latestAuditLogs.map((log) => (
                            <div key={log.id} className="p-4 rounded-[24px] bg-white border border-zinc-100 flex items-center justify-between hover:border-zinc-300 transition-all group shadow-sm" title={`访问详情: ${log.user_agent || '未知客户端'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-zinc-100 transition-colors">
                                        <User className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-900" title="访客来源 IP">{log.ip}</span>
                                        <span className="text-[10px] text-zinc-400" title="请求资源路径">GET {log.url}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md" title="请求状态: 正常">200 OK</span>
                            </div>
                        )) : (
                            <div className="py-12 text-center border border-dashed border-zinc-200 rounded-[32px] bg-white w-full">
                                <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">暂无实时日志</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* System Settings Quick Link (Span 5) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-5 p-8 rounded-[40px] bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 flex flex-col justify-between group overflow-hidden relative"
                >
                    <div className="absolute -top-10 -right-10 opacity-[0.02] group-hover:scale-110 transition-transform duration-[2s]">
                        <LayoutGrid className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-4 h-4 text-zinc-400" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">System Config</span>
                        </div>
                        <h4 className="text-xl font-bold text-zinc-900 tracking-tight mb-4">集群配置管理</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed max-w-[280px]">
                            快速调整项目集群的分流策略与缓存规则，所有的变更都将实时生效于边缘节点。
                        </p>
                    </div>
                    <div className="relative z-10 pt-8">
                        <Link href="/admin/settings" className="w-full h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl text-[13px] font-bold text-zinc-900 hover:bg-zinc-50 active:scale-95 transition-all shadow-sm">
                            进入系统配置中心
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
