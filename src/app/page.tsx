import { FileText, FolderKanban, Palette, User, Microscope } from "lucide-react";
import { ContactMenu } from "@/components/ContactMenu";

const navLinks = [
  { name: "关于", href: "/me", icon: User },
  { name: "博客", href: "/blog", icon: FileText },
  { name: "项目", href: "/projects", icon: FolderKanban },
  { name: "设计", href: "/design", icon: Palette },
  { name: "研究", href: null as string | null, icon: Microscope },
];

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full flex flex-col md:flex-row md:items-center gap-12">
        {/* Left: Hero Section */}
        <section className="flex-1 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Hank Wong
            </h1>
            <p className="text-lg text-muted leading-relaxed">
              与世界连结，<br />无限进步
            </p>
          </div>

          {/* Social Links Menu */}
          <ContactMenu />

          {/* Footer */}
          <footer className="pt-12 text-sm text-muted">
            <p>&copy; {new Date().getFullYear()} wilboerht</p>
          </footer>
        </section>

        {/* Right: Navigation */}
        <nav className="flex flex-col gap-4">
          {navLinks.map((link) =>
            link.href ? (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-2 text-lg text-muted hover:text-foreground transition-colors duration-200 relative group"
              >
                <link.icon className="w-5 h-5" />
                {link.name}
                <span className="absolute left-0 -bottom-1 w-0 h-px bg-foreground group-hover:w-full transition-all duration-200" />
              </a>
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
