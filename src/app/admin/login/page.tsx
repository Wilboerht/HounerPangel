"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        try {
            const result = await loginAction(formData);

            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            }
        } catch (e: any) {
            // Next.js redirect throws an error, which is expected.
            // If it's a redirect error, we should let it bubble up.
            if (e?.message === 'NEXT_REDIRECT' || e?.digest?.includes('NEXT_REDIRECT')) {
                throw e;
            }
            
            console.error("Login redirect/error:", e);
            setTimeout(() => setIsLoading(false), 3000); 
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#fafafa]">
            {/* Background Aesthetic - Subtle Light Orbs */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/[0.03] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/[0.03] rounded-full blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo/Icon Section */}
                <div className="flex items-center justify-center gap-8 mb-12">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-black/[0.03] flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <ShieldCheck className="w-7 h-7 text-black" />
                    </div>
                    <div className="w-px h-8 bg-black/[0.05]" />
                    <h1 className="text-2xl font-bold tracking-tight text-black">管理后台登录</h1>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-black/[0.03] rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        placeholder="管理员邮箱"
                                        className="w-full bg-black/[0.01] border border-black/[0.03] rounded-2xl py-4 pl-12 pr-4 text-black text-sm font-sans placeholder:text-black/10 focus:outline-none focus:border-black/10 focus:bg-transparent transition-all duration-300"
                                    />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black transition-colors" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="访问密钥"
                                        className="w-full bg-black/[0.01] border border-black/[0.03] rounded-2xl py-4 pl-12 pr-4 text-black text-sm font-sans placeholder:text-black/10 focus:outline-none focus:border-black/10 focus:bg-transparent transition-all duration-300"
                                    />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/[0.03] border border-red-500/10 text-red-500 text-xs py-3.5 px-4 rounded-xl flex items-center gap-2 font-medium"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white border border-black/[0.05] text-black font-bold py-4 px-6 rounded-2xl flex items-center justify-between group transition-all duration-300 disabled:opacity-50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-black/10"
                        >
                            <span className="text-sm tracking-tight pl-2">
                                {isLoading ? "验证中..." : "进入创作中心"}
                            </span>
                            
                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg]">
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                                ) : (
                                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                                )}
                            </div>
                        </motion.button>
                    </form>
                </div>

                <p className="text-center mt-12 text-[11px] text-black/20 tracking-widest font-medium">
                    &copy; {new Date().getFullYear()} Protected by wilboerht
                </p>
            </motion.div>
        </main>
    );
}
