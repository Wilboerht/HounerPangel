import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "关于我 - Hank Wong's Web",
    description: "了解 Hank Wong (wilboerht) —— 开发者、旅行爱好者及超级个体。",
};

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
                    <div className="space-y-8">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            关于我
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            Hi，我是 Hank。喜欢科技、旅行或者户外运动的相关话题。
                        </p>
                        <p className="text-lg text-muted leading-relaxed">
                           
                        </p>
                        <p className="text-lg text-muted leading-relaxed">
                            {/* 国立江源大学「人工智能计算机」专业在读 ，
                            <br /> */}
                            Genius programmer @ Vanto & @ NIHPLOD
                        </p>
                        <p className="text-lg text-muted leading-relaxed">
                            欢迎关注 ~
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
