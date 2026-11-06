import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label?: string;
  // 编辑页需要先经过未保存内容确认，由调用方接收点击事件
  onNavigate?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function BackLink({ href, label = "返回", onNavigate }: BackLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group inline-flex min-h-[44px] w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      <span>{label}</span>
    </Link>
  );
}
