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
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            关于我
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            我是 Hank Wong（wilboerht），平时喜欢写点代码，研究些新东西。目前就职于某日化品牌，全栈开发。最近在探索用 AI 快速搭网站的同时完成网站样式设计，也在准备我的第一个 App。
                        </p>
                        <p className="text-lg text-muted leading-relaxed">
                            闲下来就在路上 —— 到处走走，拍拍照，或者找个山爬一爬。目标是在 28 岁前登上第一座雪山。
                        </p>
                        <p className="text-lg text-muted leading-relaxed">
                            欢迎联系，也许也能在路上偶遇。
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
