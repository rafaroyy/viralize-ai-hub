-- Create user_history table
CREATE TABLE public.user_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  tipo text NOT NULL,
  titulo text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- RLS policies (external auth - user_id is text, no auth.uid())
CREATE POLICY "Users can insert own history"
  ON public.user_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own history"
  ON public.user_history FOR SELECT
  USING (true);

CREATE POLICY "Users can delete own history"
  ON public.user_history FOR DELETE
  USING (true);

-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

-- Allow public uploads to videos bucket
CREATE POLICY "Anyone can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Anyone can read videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');