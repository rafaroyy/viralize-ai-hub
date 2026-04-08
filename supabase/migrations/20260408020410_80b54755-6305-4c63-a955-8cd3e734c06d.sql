CREATE POLICY "Anon read trend_opportunities"
ON public.trend_opportunities
FOR SELECT
TO anon
USING (true);