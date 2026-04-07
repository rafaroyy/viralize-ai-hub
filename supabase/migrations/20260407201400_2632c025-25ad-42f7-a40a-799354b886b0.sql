
-- Permitir service_role inserir/deletar/atualizar tiktok_viral_videos
CREATE POLICY "Service insert tiktok_viral_videos" ON public.tiktok_viral_videos
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service delete tiktok_viral_videos" ON public.tiktok_viral_videos
  FOR DELETE TO service_role USING (true);
CREATE POLICY "Service update tiktok_viral_videos" ON public.tiktok_viral_videos
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- Permitir service_role gerenciar apify_search_config
CREATE POLICY "Service all apify_search_config" ON public.apify_search_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Habilitar pg_cron e pg_net para agendamento
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
