
CREATE TABLE public.analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url text NOT NULL UNIQUE,
  analysis jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.analysis_cache FOR SELECT TO public USING (true);
CREATE POLICY "Allow service insert" ON public.analysis_cache FOR INSERT TO public WITH CHECK (true);
