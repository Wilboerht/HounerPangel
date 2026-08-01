"use client";

import { motion } from "framer-motion";
import { useSafeMotion, safeAnimate, easeOut } from "@/lib/animation";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useSafeMotion();

  return (
    <motion.div
      initial={safeAnimate(reduce, { opacity: 0, y: -8 })}
      animate={{ opacity: 1, y: 0 }}
      transition={easeOut}
      style={{ willChange: reduce ? "auto" : "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
