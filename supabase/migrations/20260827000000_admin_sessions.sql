-- Server-side, revocable admin sessions.
-- Run this in your Supabase SQL Editor, or via `supabase db push`.

-- Sessions are stored as SHA-256 hashes of opaque random tokens so a database
-- leak does not expose usable tokens.
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Index for expired-session cleanup and expiry checks
CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON public.admin_sessions (expires_at);

-- Enable RLS with no policies: only the service role can access this table.
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
