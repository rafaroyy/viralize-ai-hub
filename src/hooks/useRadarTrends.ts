import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Trend, SourceSignal, Opportunity } from "@/types/radar";
import { useToast } from "@/hooks/use-toast";

function mapDbTrend(row: any, sources: any[]): Trend {
  const trendSources = sources.filter((s) => s.trend_id === row.id);
  const sourceSignals: SourceSignal[] = trendSources.map((s) => ({
    id: s.id,
    source: s.source as SourceSignal["source"],
    sourceType: s.source_type,
    signalLabel: s.signal_label,
    observedAt: s.observed_at,
    region: s.region,
    rawScore: Number(s.raw_score || 0),
    normalizedScore: Number(s.normalized_score || 0),
    url: s.url || "",
  }));

  return {
    id: row.id,
    label: row.label,
    aliases: row.aliases || [],
    category: row.category || "assunto",
    country: row.country || "BR",
    region: row.region || "BR",
    sourceSignals,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    status: row.status || "nova",
    velocityScore: row.velocity_score || 0,
    crossSourceScore: row.cross_source_score || 0,
    noveltyScore: row.novelty_score || 0,
    saturationScore: row.saturation_score || 0,
    riskScore: row.risk_score || 0,
    viralPotentialScore: row.viral_potential_score || 0,
    commercePotentialScore: row.commerce_potential_score || 0,
    overallScore: row.overall_score || 0,
    relatedTerms: row.related_terms || [],
    recommendedAngles: row.recommended_angles || [],
    suggestedHooks: row.suggested_hooks || [],
    suggestedFormats: row.suggested_formats || [],
    suggestedCtas: row.suggested_ctas || [],
    niches: (row.niches || []) as Trend["niches"],
    summary: row.summary || undefined,
  };
}

export function useRadarTrends() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  const loadTrends = useCallback(async () => {
    setLoading(true);
    try {
      const { data: trendRows, error: tErr } = await supabase
        .from("trends")
        .select("*")
        .order("overall_score", { ascending: false })
        .limit(100);

      if (tErr) throw tErr;

      if (!trendRows || trendRows.length === 0) {
        setTrends([]);
        return;
      }

      const trendIds = trendRows.map((t) => t.id);
      const { data: sourceRows } = await supabase
        .from("trend_sources")
        .select("*")
        .in("trend_id", trendIds);

      const mapped = trendRows.map((row) => mapDbTrend(row, sourceRows || []));
      setTrends(mapped);
    } catch (e: any) {
      console.error("Error loading trends:", e);
      setTrends([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchYouTube = useCallback(async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("radar-youtube-fetch");
      if (error) throw error;

      toast({
        title: "YouTube Trends atualizados!",
        description: `${data?.processed || 0} vídeos trending processados.`,
      });

      await loadTrends();
    } catch (e: any) {
      console.error("Error fetching YouTube trends:", e);
      toast({
        title: "Erro ao buscar YouTube",
        description: e.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [loadTrends, toast]);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  return { trends, opportunities, loading, fetching, fetchYouTube, refreshTrends: loadTrends };
}
