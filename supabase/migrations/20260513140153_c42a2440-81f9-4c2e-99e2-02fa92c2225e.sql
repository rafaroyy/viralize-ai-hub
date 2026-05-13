ALTER TABLE public.tiktok_viral_videos ADD COLUMN IF NOT EXISTS niche text;
CREATE INDEX IF NOT EXISTS idx_tiktok_viral_videos_niche ON public.tiktok_viral_videos(niche);