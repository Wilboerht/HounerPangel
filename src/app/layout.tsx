import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Serif, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github.css";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/toast";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-serif-sc",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hank Wong's Web",
    template: "%s - Hank Wong's Web",
  },
  description: "Hank Wong (wilboerht)'s personal website. Building things on the internet. Developer, creator, and lifelong learner.",
  keywords: [
    "Hank Wong",
    "wilboerht",
    "developer",
    "personal website",
    "portfolio"
  ],
  authors: [{ name: "Hank Wong", url: "https://wilboerht.com" }],
  creator: "wilboerht",
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "Hank Wong's Web",
    description: "Hank Wong (wilboerht)'s personal website. Building things on the internet.",
    siteName: "Hank Wong",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hank Wong's Web",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hank Wong's Web",
    description: "Hank Wong (wilboerht)'s personal website. Building things on the internet.",
    creator: "@wilboerht",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable} ${notoSerifSC.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
