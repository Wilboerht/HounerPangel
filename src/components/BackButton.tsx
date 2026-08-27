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
        const hasSameOriginReferrer =
          document.referrer !== "" &&
          new URL(document.referrer).origin === window.location.origin;
        if (hasSameOriginReferrer) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group min-h-[44px]"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
      <span>{label}</span>
    </button>
  );
}
