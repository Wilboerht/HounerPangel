"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Mail, Github, Instagram, MessageCircle, Send, Linkedin } from "lucide-react";

interface SocialLink {
    name: string;
    href: string;
    icon: any; // Type as any to accommodate Lucide React functional components passed from server to client
    qrCode?: string;
}

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
    {
        name: "WeChat",
        href: "#",
        qrCode: "/qrcode_wechat.jpg",
        icon: MessageCircle,
    },
];

export function ContactMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeQrCode, setActiveQrCode] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setActiveQrCode(null);
            }
        }

        // Close on escape key
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
                setActiveQrCode(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <div className="relative pt-2 w-fit" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="Contact options"
                className="group flex items-center gap-2 px-4 py-2 border border-border rounded-full text-sm font-medium text-muted hover:text-foreground hover:border-muted focus:text-foreground focus:border-muted transition-colors duration-200 cursor-pointer outline-none"
            >
                <span>Contact</span>
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180 opacity-100' : 'opacity-50 group-hover:opacity-100'}`} />
            </button>

            {/* Main Menu Dropdown */}
            <div
                className={`fixed inset-x-4 bottom-4 md:absolute md:inset-auto md:top-full md:left-0 md:mt-3 p-2 bg-background border border-border rounded-2xl md:rounded-xl shadow-2xl md:shadow-lg transition-all duration-200 flex flex-col gap-1 md:min-w-[160px] z-50 ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-8 md:translate-y-2 invisible pointer-events-none'
                    }`}
            >
                {/* Mobile handle indicator */}
                <div className="md:hidden w-12 h-1.5 bg-border rounded-full mx-auto my-2 shrink-0" />

                {socialLinks.map((link) => (
                    <div key={link.name} className="relative group/item w-full">
                        {link.name === "WeChat" ? (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveQrCode(activeQrCode === link.name ? null : link.name);
                                }}
                                className="flex items-center gap-3 px-3 py-3 md:py-2.5 text-muted hover:text-foreground hover:bg-foreground/5 focus:text-foreground focus:bg-foreground/5 rounded-lg transition-colors duration-200 outline-none w-full text-left"
                            >
                                <link.icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                                <span className="text-base md:text-sm font-medium md:font-normal">{link.name}</span>
                                {link.qrCode && (
                                    <span className="ml-auto text-xs opacity-50 md:hidden">
                                        {activeQrCode === link.name ? "Close QR" : "Show QR"}
                                    </span>
                                )}
                            </button>
                        ) : (
                            <a
                                href={link.href}
                                target={link.name !== "Email" ? "_blank" : undefined}
                                rel={link.name !== "Email" ? "noopener noreferrer" : undefined}
                                className="flex items-center gap-3 px-3 py-3 md:py-2.5 text-muted hover:text-foreground hover:bg-foreground/5 focus:text-foreground focus:bg-foreground/5 rounded-lg transition-colors duration-200 outline-none w-full"
                            >
                                <link.icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                                <span className="text-base md:text-sm font-medium md:font-normal">{link.name}</span>
                            </a>
                        )}

                        {/* QR Code Tooltip (Desktop Hover + Mobile Click) */}
                        {link.qrCode && (
                            <div
                                className={`
                  /* Desktop: Always to the right, relies on hover */
                  md:absolute md:left-[105%] md:top-1/2 md:-translate-y-1/2 md:ml-2 md:p-2 md:bg-background md:border md:border-border md:rounded-xl md:shadow-xl md:transition-all md:duration-200 md:z-20
                  md:group-hover/item:opacity-100 md:group-hover/item:visible md:group-hover/item:translate-x-0
                  ${!activeQrCode && 'md:opacity-0 md:invisible md:translate-x-[-10px]'}
                  
                  /* Mobile: Inline accordion style below the button */
                  relative w-full overflow-hidden transition-all duration-300 ease-in-out z-20 flex justify-center
                  ${activeQrCode === link.name ? 'max-h-[400px] opacity-100 mt-2 pb-2' : 'max-h-0 opacity-0 md:max-h-[400px] md:opacity-100'}
                `}
                            >
                                <div className="relative w-full max-w-[260px] aspect-square md:w-36 md:h-36 md:max-w-none bg-foreground/5 rounded-xl md:rounded-md p-4 md:p-0 flex items-center justify-center mx-auto">
                                    <Image
                                        src={link.qrCode}
                                        alt={`${link.name} QR Code`}
                                        fill
                                        className="object-contain p-2 md:p-0 rounded-xl md:rounded-md"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Mobile quick close button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden mt-2 p-3 w-full bg-foreground/5 text-foreground font-medium rounded-xl mb-1"
                >
                    Cancel
                </button>
            </div>

            {/* Mobile Backdrop Overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                aria-hidden="true"
                onClick={() => setIsOpen(false)}
            />
        </div>
    );
}
