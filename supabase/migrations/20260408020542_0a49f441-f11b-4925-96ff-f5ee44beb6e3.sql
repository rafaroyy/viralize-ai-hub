CREATE POLICY "Service all trend_opportunities"
ON public.trend_opportunities
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);