import Image from "next/image";
import { Mail, Github, Twitter, Instagram, FileText, FolderKanban, Palette, Library, User, ChevronDown, MessageCircle, Send } from "lucide-react";

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
  {
    name: "Instagram",
    href: "https://www.instagram.com/wilboerht?igsh=NWVyNjM4M2V6bjJw&utm_source=qr",
    icon: Instagram,
  },
  {
    name: "Telegram",
    href: "https://t.me/wilboerht",
    icon: Send,
  },
  {
    name: "WeChat",
    href: "#",
    qrCode: "/qrcode_wechat.jpg",
    icon: MessageCircle,
  },
];

const navLinks = [
  { name: "About", href: "/me", icon: User },
  { name: "Blog", href: "https://blog.wilboerht.com", icon: FileText },
  { name: "Projects", href: "/projects", icon: FolderKanban },
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

          {/* Social Links Menu */}
          <div className="relative group pt-2 w-fit">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-full text-sm font-medium text-muted hover:text-foreground hover:border-muted focus:text-foreground focus:border-muted transition-colors duration-200 cursor-pointer outline-none">
              <span>Contact</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="absolute top-full left-0 mt-3 p-2 bg-background border border-border rounded-xl shadow-lg opacity-0 invisible translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 group-hover:visible focus-within:translate-y-0 focus-within:opacity-100 focus-within:visible transition-all duration-200 flex flex-col gap-1 min-w-[160px] z-10">
              {socialLinks.map((link) => (
                <div key={link.name} className="relative group/item">
                  <a
                    href={link.name === "WeChat" ? undefined : link.href}
                    target={link.name !== "Email" && link.name !== "WeChat" ? "_blank" : undefined}
                    rel={link.name !== "Email" && link.name !== "WeChat" ? "noopener noreferrer" : undefined}
                    tabIndex={link.name === "WeChat" ? 0 : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 text-muted hover:text-foreground hover:bg-foreground/5 focus:text-foreground focus:bg-foreground/5 rounded-lg transition-colors duration-200 outline-none w-full ${link.name === "WeChat" ? "cursor-default" : ""}`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="text-sm">{link.name}</span>
                  </a>

                  {/* QR Code Tooltip */}
                  {link.qrCode && (
                    <div className="absolute left-[105%] top-0 md:top-1/2 md:-translate-y-1/2 ml-2 p-2 bg-background border border-border rounded-xl shadow-xl opacity-0 invisible translate-x-[-10px] group-hover/item:translate-x-0 group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-20 pointer-events-none">
                      <div className="relative w-32 h-32 md:w-36 md:h-36">
                        <Image
                          src={link.qrCode}
                          alt={`${link.name} QR Code`}
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
