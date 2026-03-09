import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";

export default function Design() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full flex flex-col gap-12">
                {/* Navigation */}
                <nav>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back to Home</span>
                    </Link>
                </nav>

                {/* Content */}
                <section className="space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Design
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            A collection of my design explorations, UI concepts, and visual experiments.
                        </p>
                    </div>

                    {/* Placeholder for Design Portfolio grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Example Design Item */}
                        <div className="flex flex-col gap-3 group cursor-pointer">
                            {/* Image Container with Aspect Ratio */}
                            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-foreground/5 group-hover:border-foreground/30 transition-colors duration-300">
                                {/* Placeholder for an actual image */}
                                <div className="absolute inset-0 flex items-center justify-center text-muted group-hover:scale-105 transition-transform duration-500">
                                    <Sparkles className="w-8 h-8 opacity-50" />
                                </div>
                            </div>

                            <div className="px-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                                        Component Library UI
                                    </h3>
                                    <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200 opacity-0 group-hover:opacity-100" />
                                </div>
                                <p className="text-sm text-muted mt-1 leading-relaxed">
                                    Sleek, accessibile components for web.
                                </p>
                            </div>
                        </div>

                        {/* Another Example Design Item */}
                        <div className="flex flex-col gap-3 group cursor-pointer">
                            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-foreground/5 group-hover:border-foreground/30 transition-colors duration-300">
                                <div className="absolute inset-0 flex items-center justify-center text-muted group-hover:scale-105 transition-transform duration-500">
                                    <Sparkles className="w-8 h-8 opacity-50" />
                                </div>
                            </div>

                            <div className="px-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                                        Brand Identity Concept
                                    </h3>
                                    <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200 opacity-0 group-hover:opacity-100" />
                                </div>
                                <p className="text-sm text-muted mt-1 leading-relaxed">
                                    Typography and color system exploration.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-8 text-sm text-muted border-t border-white/10">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
