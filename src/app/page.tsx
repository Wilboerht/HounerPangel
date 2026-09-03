import Link from "next/link";
import { FileText, MapPin, User } from "lucide-react";
import type { Metadata } from "next";
import { ContactMenu } from "@/components/ContactMenu";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
    alternates: {
        canonical: SITE_URL,
    },
};

const navLinks = [
  { name: "关于", href: "/me", icon: User },
  { name: "博客", href: "/blog", icon: FileText },
  { name: "足迹", href: "/map", icon: MapPin },
];

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Person",
            name: "Hank Wong",
            alternateName: "wilboerht",
            url: SITE_URL,
            jobTitle: "Developer",
            sameAs: [
                "https://github.com/wilboerht",
                "https://www.linkedin.com/in/wilboerht/",
                "https://x.com/wilboerht",
                "https://www.instagram.com/wilboerht",
                "https://t.me/wilboerht",
            ],
        },
        {
            "@type": "WebSite",
            name: "Hank Wong's Web",
            url: SITE_URL,
            inLanguage: "zh-CN",
        },
    ],
};

export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-12 pt-safe pb-safe">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-2xl w-full flex flex-col md:flex-row md:items-center gap-12">
        <section className="flex-1 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Hank Wong
          </h1>
          <ContactMenu />
          <footer className="text-sm text-muted">
            <p>&copy; {new Date().getFullYear()} wilboerht</p>
          </footer>
        </section>
        <nav className="flex flex-col gap-4">
          {navLinks.map((link) =>
            link.href ? (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-2 text-lg text-muted hover:text-foreground transition-colors duration-200 relative group"
              >
                <link.icon className="w-5 h-5" />
                {link.name}
                <span className="absolute left-0 -bottom-1 w-0 h-px bg-foreground group-hover:w-full transition-all duration-200" />
              </Link>
            ) : (
              <span
                key={link.name}
                className="flex items-center gap-2 text-lg text-muted/40 cursor-not-allowed"
                aria-disabled="true"
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </span>
            )
          )}
        </nav>
      </div>
    </main>
  );
}
