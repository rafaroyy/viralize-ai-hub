ALTER TABLE public.creator_profiles
  ADD COLUMN brand_cause text DEFAULT '',
  ADD COLUMN brand_tribe text DEFAULT '',
  ADD COLUMN brand_enemy text DEFAULT '',
  ADD COLUMN brand_archetype text DEFAULT '',
  ADD COLUMN brand_origin_story text DEFAULT '',
  ADD COLUMN brand_recognition text DEFAULT '',
  ADD COLUMN brand_competitor_weakness text DEFAULT '';