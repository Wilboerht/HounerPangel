import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hank Wong's Web",
  description: "Hank Wong (wilboerht)'s personal website. Building things on the internet. Developer, creator, and lifelong learner.",
  keywords: [
    "Hank Wong",
    "wilboerht",
    "developer",
    "personal website",
    "blog",
    "portfolio"
  ],
  authors: [{ name: "Hank Wong", url: "https://wilboerht.com" }],
  creator: "wilboerht",
  icons: {
    icon: '/',
    apple: '/',
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
    title: "Hank Wong's Web",
    description: "Hank Wong (wilboerht)'s personal website. Building things on the internet.",
    siteName: "Hank Wong",
  },
  twitter: {
    card: "summary",
    title: "Hank Wong's Web",
    description: "Hank Wong (wilboerht)'s personal website. Building things on the internet.",
    creator: "@wilboerht",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
