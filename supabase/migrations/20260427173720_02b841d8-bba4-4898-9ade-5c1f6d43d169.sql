-- Drop old check constraint and recreate including 'niche'
ALTER TABLE public.apify_search_config
DROP CONSTRAINT IF EXISTS apify_search_config_config_type_check;

ALTER TABLE public.apify_search_config
ADD CONSTRAINT apify_search_config_config_type_check
CHECK (config_type IN ('hashtag', 'search_query', 'niche'));

-- Seed 3 niches
INSERT INTO public.apify_search_config (config_type, value, active)
VALUES
  ('niche', '{"slug":"lifestyle","label":"Lifestyle","hashtag":"lifestyle"}', true),
  ('niche', '{"slug":"fitness","label":"Fitness","hashtag":"fitness"}', true),
  ('niche', '{"slug":"mercado-digital","label":"Mercado Digital","hashtag":"mercadodigital"}', true);
