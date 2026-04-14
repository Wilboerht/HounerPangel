import { FileText, FolderKanban, Palette, User, Microscope } from "lucide-react";
import { ContactMenu } from "@/components/ContactMenu";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);


const navLinks = [
  { name: "About", href: "/me", icon: User },
  { name: "Blog", href: "/blog", icon: FileText },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Design", href: "/design", icon: Palette },
  { name: "Research", href: "/research", icon: Microscope },
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
              Building things on the internet.
              <br />
              Always learning, always creating.
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
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="flex items-center gap-2 text-lg text-muted hover:text-foreground transition-colors duration-200 relative group"
            >
              <link.icon className="w-5 h-5" />
              {link.name}
              <span className="absolute left-0 -bottom-1 w-0 h-px bg-foreground group-hover:w-full transition-all duration-200" />
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
