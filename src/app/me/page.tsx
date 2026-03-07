import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutMe() {
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
                            About Me
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            Hi, I'm Hank Wong. I am a developer passionate about building simple, elegant, and user-centric experiences on the internet.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            What I Do
                        </h2>
                        <p className="text-muted leading-relaxed">
                            I specialize in front-end development, creating responsive, performant, and accessible interfaces. My focus is always on creating products that look great and feel effortless to use.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            Philosophy
                        </h2>
                        <p className="text-muted leading-relaxed">
                            I believe in clean code, intuitive design, and continuous learning. Simplicity is the ultimate sophistication, and my goal is to distill complex problems into elegant solutions.
                        </p>
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
