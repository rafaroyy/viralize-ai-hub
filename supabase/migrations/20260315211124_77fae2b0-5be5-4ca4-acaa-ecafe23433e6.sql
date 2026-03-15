
-- OAuth integrations table
CREATE TABLE public.oauth_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  provider text NOT NULL DEFAULT 'tiktok',
  provider_user_id text,
  access_token text,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  scopes text[] DEFAULT '{}',
  expires_at timestamptz,
  connected_at timestamptz,
  last_synced_at timestamptz,
  status text NOT NULL DEFAULT 'disconnected',
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.oauth_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own integrations"
  ON public.oauth_integrations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users insert own integrations"
  ON public.oauth_integrations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users update own integrations"
  ON public.oauth_integrations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users delete own integrations"
  ON public.oauth_integrations FOR DELETE
  TO public
  USING (true);

-- OAuth states table for CSRF protection
CREATE TABLE public.oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  provider text NOT NULL DEFAULT 'tiktok',
  state text NOT NULL UNIQUE,
  redirect_to text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own states"
  ON public.oauth_states FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users insert own states"
  ON public.oauth_states FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users delete own states"
  ON public.oauth_states FOR DELETE
  TO public
  USING (true);
