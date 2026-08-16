# Hank Wong's Web

Personal website of Hank Wong (wilboerht). A digital space for showcasing projects, thoughts, and designs.

## Features

- **Blog** — Markdown posts with tags, stored in Supabase; RSS feed (`/rss.xml`), sitemap, and SEO metadata included
- **Admin panel** (`/admin`) — password-protected post editor with image upload to Supabase Storage, session auth, and rate limiting
- **Footprint map** (`/map`) — fullscreen map of visited cities, built with MapLibre GL and the free CARTO Positron basemap (no API token required); city data lives in `src/data/cities.ts`
- **About** (`/me`) — a short introduction

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Storage) for the blog
- MapLibre GL + react-map-gl for the footprint map
- Vercel Analytics

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` with the required variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_PASSWORD=your-admin-password
   SESSION_SECRET=your-session-secret
   # optional, used for absolute URLs in sitemap/RSS/OG
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```
4. Set up the database by running the SQL in `supabase/migrations/` (via Supabase SQL Editor or `supabase db push`)
5. Run the development server:
   ```bash
   npm run dev
   ```

Open http://localhost:3000 with your browser to see the result.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — run ESLint

## License

All rights reserved.
