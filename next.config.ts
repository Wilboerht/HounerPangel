import type { NextConfig } from "next";

// Keep in sync with IFRAME_ALLOWED_DOMAINS in src/lib/markdown.tsx
const iframeAllowedDomains = [
  "embed.music.apple.com",
  "open.spotify.com",
  "bandcamp.com",
  "www.youtube.com",
  "youtube.com",
  "player.bilibili.com",
  "music.163.com",
  "y.qq.com",
  "platform.twitter.com",
  "twitter.com",
  "x.com",
  "www.instagram.com",
  "instagram.com",
];

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' is required for Next hydration; 'unsafe-eval' only for dev HMR
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://*.basemaps.cartocdn.com",
  "media-src https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co https://*.basemaps.cartocdn.com",
  "worker-src 'self' blob:",
  "font-src 'self' data:",
  `frame-src ${iframeAllowedDomains.map((d) => `https://${d}`).join(" ")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hyuqehvxhjfmihkzireg.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
