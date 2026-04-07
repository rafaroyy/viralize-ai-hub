
-- Tabela para armazenar vídeos virais do TikTok (compartilhada entre todos os usuários)
CREATE TABLE public.tiktok_viral_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
  author_name text,
  author_username text,
  author_avatar text,
  description text,
  video_url text,
  cover_url text,
  play_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  duration integer DEFAULT 0,
  hashtags text[] DEFAULT '{}'::text[],
  music_name text,
  posted_at timestamp with time zone,
  fetched_at timestamp with time zone DEFAULT now(),
  week_key text NOT NULL,
  raw_payload jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela de configuração de busca do Apify (termos e hashtags)
CREATE TABLE public.apify_search_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type text NOT NULL CHECK (config_type IN ('hashtag', 'search_query')),
  value text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS: todos os usuários autenticados podem ler os vídeos
ALTER TABLE public.tiktok_viral_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read tiktok_viral_videos" ON public.tiktok_viral_videos
  FOR SELECT TO authenticated USING (true);

-- RLS: todos os autenticados podem ler a config (admin gerencia via service_role)
ALTER TABLE public.apify_search_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read apify_search_config" ON public.apify_search_config
  FOR SELECT TO authenticated USING (true);

-- Inserir termos e hashtags padrão do Brasil
INSERT INTO public.apify_search_config (config_type, value) VALUES
  ('hashtag', 'viral'),
  ('hashtag', 'brasil'),
  ('hashtag', 'fyp'),
  ('hashtag', 'tiktokbrasil'),
  ('search_query', 'viral brasil'),
  ('search_query', 'trending brasil 2026');
