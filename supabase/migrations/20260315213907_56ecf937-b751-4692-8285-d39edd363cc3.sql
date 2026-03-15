-- Drop existing partial unique indexes
DROP INDEX IF EXISTS public.trends_external_id_unique;
DROP INDEX IF EXISTS public.trend_sources_external_id_unique;

-- Create proper UNIQUE indexes (non-partial) for PostgREST onConflict support
CREATE UNIQUE INDEX trends_external_id_unique ON public.trends (external_id);
CREATE UNIQUE INDEX trend_sources_external_id_unique ON public.trend_sources (external_id);