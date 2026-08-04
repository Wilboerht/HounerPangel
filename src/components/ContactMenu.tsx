"use client";

import { Mail, Github, Instagram, Send, Linkedin } from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

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
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/wilboerht/",
        icon: Linkedin,
    },
    {
        name: "X",
        href: "https://x.com/wilboerht",
        icon: XIcon,
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
];

export function ContactMenu() {
    return (
        <div className="flex items-center gap-1">
            {socialLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.href}
                    target={link.name !== "Email" ? "_blank" : undefined}
                    rel={link.name !== "Email" ? "noopener noreferrer" : undefined}
                    title={link.name}
                    aria-label={link.name}
                    className="p-2.5 text-muted hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-foreground/5"
                >
                    <link.icon className="w-[18px] h-[18px]" />
                </a>
            ))}
        </div>
    );
}
