
CREATE POLICY "Anon read tiktok_viral_videos" ON public.tiktok_viral_videos
  FOR SELECT TO anon USING (true);
