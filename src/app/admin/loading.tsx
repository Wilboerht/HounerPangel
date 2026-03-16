"use client";

import { motion } from "framer-motion";

export default function AdminLoading() {
    return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-6">
            <div className="relative w-12 h-12">
                {/* Minimalist Spinner */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="w-full h-full border-2 border-zinc-100 border-t-zinc-900 rounded-full"
                />
            </div>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-medium text-zinc-400 tracking-wider"
            >
                正在加载数据...
            </motion.p>
        </div>
    );
}
