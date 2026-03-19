CREATE TABLE public.creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  niche text NOT NULL DEFAULT '',
  sub_niches text[] DEFAULT '{}',
  target_audience text NOT NULL DEFAULT '',
  content_style text NOT NULL DEFAULT '',
  main_platforms text[] DEFAULT '{tiktok}',
  profile_handle text DEFAULT '',
  average_views text DEFAULT '',
  goals text DEFAULT '',
  tone_of_voice text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profile" ON public.creator_profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profile" ON public.creator_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profile" ON public.creator_profiles FOR UPDATE USING (true) WITH CHECK (true);