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
        <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-50/50">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[380px]"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm mb-4">
                        <Lock className="w-5 h-5 text-zinc-900" />
                    </div>
                    <h1 className="text-xl font-bold text-zinc-900">管理后台</h1>
                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-[0.2em]">Restricted Access</p>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-zinc-100 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-3.5">
                            <div className="relative group/field">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/field:text-zinc-900 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="管理员邮箱"
                                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-300 focus:bg-white transition-all"
                                />
                            </div>
                            <div className="relative group/field">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/field:text-zinc-900 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="访问密钥"
                                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-300 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center text-red-500 text-[11px] font-bold"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            ) : (
                                <>
                                    <span>验证并进入</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-[10px] text-zinc-300 tracking-widest font-bold">
                    &copy; {new Date().getFullYear()} wilboerht
                </p>
            </motion.div>
        </main>
    );
}
