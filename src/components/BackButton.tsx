"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  fallbackHref?: string;
}

export default function BackButton({ label = "返回", fallbackHref = "/" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm text-muted bg-transparent border border-transparent hover:bg-foreground/5 hover:border-border/50 hover:text-foreground transition-all duration-200 group min-h-[44px]"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
      <span>{label}</span>
    </button>
  );
}
