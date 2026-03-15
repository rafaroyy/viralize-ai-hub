CREATE POLICY "Anon read trends" ON public.trends FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read trend_sources" ON public.trend_sources FOR SELECT TO anon USING (true);