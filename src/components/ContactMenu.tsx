"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Github, Instagram, Send, Linkedin, X } from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

const WeChatIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17.5 9.5c0-2.5-2.5-4.5-5.5-4.5S6.5 7 6.5 9.5c0 1.4.8 2.7 2 3.5l-.5 2 2-1c.6.2 1.2.3 1.9.3" />
        <path d="M21 14.5c0-2.2-2-4-4.5-4s-4.5 1.8-4.5 4c0 1.2.7 2.2 1.7 3l-.4 1.5 1.5-.9c.5.1 1 .2 1.5.2" />
        <circle cx="8.5" cy="9" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="12.5" cy="9" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="14" cy="14.5" r="0.4" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="14.5" r="0.4" fill="currentColor" stroke="none" />
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
    const [showQr, setShowQr] = useState(false);

    return (
        <div className="space-y-3">
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
                <button
                    onClick={() => setShowQr(!showQr)}
                    title="WeChat"
                    aria-label="WeChat"
                    aria-expanded={showQr}
                    className="p-2.5 text-muted hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-foreground/5"
                >
                    <WeChatIcon className="w-[18px] h-[18px]" />
                </button>
            </div>

            {showQr && (
                <div className="flex items-center gap-3">
                    <div className="relative w-32 aspect-square rounded-xl overflow-hidden border border-border/50 bg-background">
                        <Image
                            src="/images/qrcode_wechat.jpg"
                            alt="WeChat QR Code"
                            fill
                            className="object-contain p-2"
                        />
                    </div>
                    <button
                        onClick={() => setShowQr(false)}
                        className="p-2 text-muted hover:text-foreground transition-colors"
                        aria-label="关闭二维码"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
