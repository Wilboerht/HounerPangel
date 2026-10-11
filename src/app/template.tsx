"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSafeMotion, safeAnimate, easeOut } from "@/lib/animation";

// 不要在这里常驻 will-change: transform——按 CSS 规范它会让本元素成为
// fixed 后代的包含块，导致侧边栏/弹窗等 fixed 元素脱离视口定位。
// framer-motion 在动画运行期间会自动管理 will-change。
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useSafeMotion();
  const pathname = usePathname();

  // 管理端跳过入场动画：动画期间的真实 transform 同样会改变 fixed 包含块，
  // 会让侧边栏/弹窗在入场瞬间脱离视口定位
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={safeAnimate(reduce, { opacity: 0, y: -8 })}
      animate={{ opacity: 1, y: 0 }}
      transition={easeOut}
    >
      {children}
    </motion.div>
  );
}
