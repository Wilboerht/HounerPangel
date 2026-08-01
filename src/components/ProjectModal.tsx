"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    logoSrc: string;
    logoAlt: string;
    logoHeight?: number;
    logoMb?: number;
    children: ReactNode;
}

export function ProjectModal({
    isOpen,
    onClose,
    logoSrc,
    logoAlt,
    logoHeight = 34,
    logoMb = 7,
    children,
}: ProjectModalProps) {
    const reduce = useSafeMotion();
    const trapRef = useFocusTrap(isOpen);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={safeAnimate(reduce, { opacity: 0 })}
                        animate={{ opacity: 1 }}
                        exit={safeAnimate(reduce, { opacity: 0 })}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100]"
                    />
                    <motion.div
                        initial={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
                        transition={springModal}
                        className="fixed inset-0 flex items-center justify-center z-[101] p-6"
                    >
                        <div
                            ref={trapRef}
                            role="dialog"
                            aria-modal="true"
                            aria-label={logoAlt}
                            className="relative w-full max-w-[600px] bg-white rounded-[28px] shadow-[0_45px_80px_-16px_rgba(0,0,0,0.15)] overflow-hidden max-h-[85vh] flex flex-col"
                        >
                            <div className="absolute top-6 right-6 z-10">
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                            <div className="flex flex-col items-center pt-14 pb-8 px-10">
                                <Image
                                    src={logoSrc}
                                    alt={logoAlt}
                                    width={logoHeight * 4}
                                    height={logoHeight}
                                    className="w-auto mb-7"
                                    style={{ height: logoHeight, marginBottom: logoMb * 4 }}
                                />
                            </div>
                            <div className="px-10 pb-10 overflow-y-auto">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
