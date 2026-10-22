"use client";

import { usePathname } from "next/navigation";

// 入场动画用纯 CSS（.page-enter，见 globals.css），不引入 framer-motion，
// 避免它进入所有公开页面的首屏 bundle。
// 注意：动画期间的 transform 会让本元素成为 fixed 后代的包含块，
// 导致侧边栏/弹窗等 fixed 元素脱离视口定位，因此管理端跳过入场动画。
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return <div className="page-enter">{children}</div>;
}
