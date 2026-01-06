import { Mail, Github, Twitter, FileText, FolderKanban, Palette, Library } from "lucide-react";

const socialLinks = [
  {
    name: "Email",
    href: "mailto:me@wilboerht.cn",
    icon: Mail,
  },
  {
    name: "GitHub",
    href: "https://github.com/wilboerht",
    icon: Github,
  },
  {
    name: "Twitter",
    href: "https://x.com/wilboerht",
    icon: Twitter,
  },
];

const navLinks = [
  { name: "Blog", href: "https://blog.wilboerht.com", icon: FileText },
  { name: "Projects", href: "https://project.wilboerht.com", icon: FolderKanban },
  { name: "Design", href: "https://design.wilboerht.com", icon: Palette },
  { name: "Library", href: "https://library.wilboerht.com", icon: Library },
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

          {/* Social Links */}
          <div className="flex flex-wrap gap-6 pt-2">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.name !== "Email" ? "_blank" : undefined}
                rel={link.name !== "Email" ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 text-muted hover:text-foreground transition-colors duration-200"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </a>
            ))}
          </div>

          {/* Footer */}
          <footer className="pt-12 text-sm text-muted">
            <p>&copy; 2025 Hank Wong</p>
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
