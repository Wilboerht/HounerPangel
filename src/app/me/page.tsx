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
                        <span>返回主页</span>
                    </Link>
                </nav>

                {/* Content */}
                <section className="space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            About Me
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            Hello, I'm Hank Wong (wilboerht). I'm a developer and super individual, building digital spaces while exploring the world's beauty and embracing every new possibility.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            What I Do
                        </h2>
                        <p className="text-muted leading-relaxed">
                            I specialize in software development, but my life is fueled by travel and outdoor adventures. I thrive on new things and interesting projects that challenge my boundaries and broaden my horizons.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            Philosophy
                        </h2>
                        <p className="text-muted leading-relaxed">
                            As a 'Super Individual', I believe true growth happens at the intersection of technical discipline and the courage to explore the unknown. My goal is to stay curious, distilling complex global experiences and technical problems into simple, elegant, and intuitive digital solutions.
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
