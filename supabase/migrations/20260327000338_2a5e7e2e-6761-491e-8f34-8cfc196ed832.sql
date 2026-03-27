
CREATE TABLE public.weekly_digest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_key text UNIQUE NOT NULL,
  content jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_digest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read weekly_digest"
  ON public.weekly_digest
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon users can read weekly_digest"
  ON public.weekly_digest
  FOR SELECT
  TO anon
  USING (true);
