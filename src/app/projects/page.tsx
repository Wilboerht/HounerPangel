import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function Projects() {
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
                            Projects
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            A showcase of my recent work and side projects.
                        </p>
                    </div>

                    {/* Placeholder for projects list */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Example Project Card */}
                        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 group hover:border-foreground/50 transition-colors duration-200">
                            <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center justify-between">
                                Project Name
                                <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200" />
                            </h3>
                            <p className="text-sm text-muted leading-relaxed flex-1">
                                A brief description of the project, what it does, and the technologies used.
                            </p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-xs px-2 py-1 rounded-md bg-foreground/5 text-muted">React</span>
                                <span className="text-xs px-2 py-1 rounded-md bg-foreground/5 text-muted">Next.js</span>
                            </div>
                        </div>

                        {/* Additional project cards can go here */}
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
