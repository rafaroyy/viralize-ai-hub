
-- Trends main table
CREATE TABLE public.trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'assunto',
  country TEXT NOT NULL DEFAULT 'BR',
  region TEXT NOT NULL DEFAULT 'BR',
  status TEXT NOT NULL DEFAULT 'nova',
  velocity_score INTEGER DEFAULT 0,
  cross_source_score INTEGER DEFAULT 0,
  novelty_score INTEGER DEFAULT 0,
  saturation_score INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  viral_potential_score INTEGER DEFAULT 0,
  commerce_potential_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  related_terms TEXT[] DEFAULT '{}',
  recommended_angles TEXT[] DEFAULT '{}',
  suggested_hooks TEXT[] DEFAULT '{}',
  suggested_formats TEXT[] DEFAULT '{}',
  suggested_ctas TEXT[] DEFAULT '{}',
  niches TEXT[] DEFAULT '{}',
  summary TEXT,
  external_id TEXT,
  raw_payload JSONB,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trend sources / signals
CREATE TABLE public.trend_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_id UUID REFERENCES public.trends(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL,
  source_type TEXT NOT NULL,
  signal_label TEXT NOT NULL,
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  region TEXT NOT NULL DEFAULT 'BR',
  raw_score NUMERIC DEFAULT 0,
  normalized_score NUMERIC DEFAULT 0,
  url TEXT,
  external_id TEXT,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trend snapshots (historical)
CREATE TABLE public.trend_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_id UUID REFERENCES public.trends(id) ON DELETE CASCADE NOT NULL,
  overall_score INTEGER DEFAULT 0,
  velocity_score INTEGER DEFAULT 0,
  snapshot_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trend clusters
CREATE TABLE public.trend_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  trend_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trend opportunities
CREATE TABLE public.trend_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_id UUID REFERENCES public.trends(id) ON DELETE CASCADE NOT NULL,
  niche TEXT NOT NULL,
  why_now TEXT,
  hooks TEXT[] DEFAULT '{}',
  video_ideas TEXT[] DEFAULT '{}',
  narrative TEXT,
  cta TEXT,
  suggested_product_keywords TEXT[] DEFAULT '{}',
  opportunity_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trend watchlist (per user)
CREATE TABLE public.trend_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trend_id UUID REFERENCES public.trends(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, trend_id)
);

-- Trend settings (per user)
CREATE TABLE public.trend_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  active_sources TEXT[] DEFAULT '{google,tiktok,youtube,noticias}',
  update_frequency TEXT DEFAULT '1h',
  priority_niches TEXT[] DEFAULT '{}',
  score_sensitivity INTEGER DEFAULT 50,
  alert_threshold INTEGER DEFAULT 70,
  ingestion_mode TEXT DEFAULT 'automatico',
  n8n_webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fetch runs (ingestion logs)
CREATE TABLE public.trend_fetch_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  items_count INTEGER DEFAULT 0,
  error_message TEXT,
  raw_payload JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Blocked terms (per user)
CREATE TABLE public.blocked_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  term TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, term)
);

-- Blocked categories (per user)
CREATE TABLE public.blocked_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

-- RLS
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_fetch_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_categories ENABLE ROW LEVEL SECURITY;

-- Public read for trends, sources, snapshots, clusters, opportunities
CREATE POLICY "Authenticated read trends" ON public.trends FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read trend_sources" ON public.trend_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read trend_snapshots" ON public.trend_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read trend_clusters" ON public.trend_clusters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read trend_opportunities" ON public.trend_opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read trend_fetch_runs" ON public.trend_fetch_runs FOR SELECT TO authenticated USING (true);

-- User-scoped policies for watchlist, settings, blocked
CREATE POLICY "Users manage own watchlist" ON public.trend_watchlist FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own settings" ON public.trend_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own blocked_terms" ON public.blocked_terms FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own blocked_categories" ON public.blocked_categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_trends_status ON public.trends(status);
CREATE INDEX idx_trends_overall_score ON public.trends(overall_score DESC);
CREATE INDEX idx_trend_sources_trend_id ON public.trend_sources(trend_id);
CREATE INDEX idx_trend_snapshots_trend_id ON public.trend_snapshots(trend_id);
CREATE INDEX idx_trend_watchlist_user ON public.trend_watchlist(user_id);
CREATE INDEX idx_trend_settings_user ON public.trend_settings(user_id);
