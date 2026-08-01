"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useSafeMotion, safeAnimate, easeOutLong } from "@/lib/animation";

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useSafeMotion();

  return (
    <motion.div
      initial={safeAnimate(reduce, { opacity: 0, y: 24 })}
      whileInView={safeAnimate(reduce, { opacity: 1, y: 0 })}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ ...easeOutLong, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
