import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageLayoutProps {
    children: React.ReactNode;
    backHref?: string;
    backLabel?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-3xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
};

export function PageLayout({
    children,
    backHref,
    backLabel = "返回主页",
    maxWidth = "xl",
    className = "",
}: PageLayoutProps) {
    return (
        <main className={`min-h-screen flex flex-col items-center justify-center px-6 py-12 ${className}`}>
            <div className={`${maxWidthClasses[maxWidth]} w-full flex flex-col gap-12`}>
                {backHref && (
                    <nav>
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                            <span>{backLabel}</span>
                        </Link>
                    </nav>
                )}

                {children}

                <footer className="pt-8 text-sm text-muted border-t border-white/10">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
