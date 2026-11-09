import Link from "next/link";
import BackButton from "@/components/BackButton";

export function ContentTopbar({ backHref, backLabel }: { backHref: string; backLabel: string }) {
    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] w-full max-w-[calc(80rem+3rem)] items-center justify-between gap-4 px-content pt-[env(safe-area-inset-top,0px)]">
                <BackButton label={backLabel} fallbackHref={backHref} />
                <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
                    Hank Wong
                </Link>
            </div>
        </header>
    );
}
