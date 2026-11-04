# Hank Wong's Web

Personal website of Hank Wong (wilboerht). A digital space for showcasing projects, thoughts, and designs.

## Features

- **Blog** — Markdown posts with tags, archives, custom SEO/share metadata, RSS feed (`/rss.xml`), sitemap, and SEO metadata included
- **Admin panel** (`/admin`) — revision history, restorable trash, server-side list filtering and bulk actions, JSON backup import/export, media library, live unsaved preview, link checks, lightweight page-view analytics, session management, and audit logs
- **Footprint map** (`/map`) — fullscreen MapLibre GL map with CARTO Positron; cities are managed in the admin panel and stored in Supabase, with `src/data/cities.ts` as a build-time fallback
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
   # min 6 characters; use 12+ high-entropy characters in production
   ADMIN_PASSWORD=your-admin-password
   # optional, used for absolute URLs in sitemap/RSS/OG
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   # optional but strongly recommended in production: enables distributed rate
   # limiting via Upstash Redis (in-memory fallback is per-instance only and
   # barely effective on serverless); a startup warning is logged when missing
   UPSTASH_REDIS_REST_URL=your-upstash-rest-url
   UPSTASH_REDIS_REST_TOKEN=your-upstash-rest-token
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
- `npm run typecheck` — run `tsc --noEmit`
- `npm run clear:storage` — list buckets whose files would be deleted; append `-- --yes` to actually empty them

## Resetting the database (dangerous)

`supabase/reset.sql` drops all tables/policies/buckets and recreates the blog schema from scratch. **All data is lost and cannot be undone.** Because the script `TRUNCATE`s the storage tables, physical files become orphaned and can no longer be deleted via the Storage API afterwards — always clear the files first:

```bash
npm run clear:storage -- --yes   # 1. delete all stored files via the Storage API
# 2. then run supabase/reset.sql in the Supabase SQL Editor
```

## License

All rights reserved.
