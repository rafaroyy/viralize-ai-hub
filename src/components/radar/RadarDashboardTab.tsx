import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RadarCharts } from "./RadarCharts";
import { TrendCard } from "./TrendCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Youtube, Play, Heart, Eye, TrendingUp, Zap, ShoppingCart, MessageCircle, Music, Hash } from "lucide-react";
import type { Trend } from "@/types/radar";

interface Props {
  trends: Trend[];
  onViewDetail: (t: Trend) => void;
  loading?: boolean;
  fetching?: boolean;
  onFetchYouTube?: () => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function RadarDashboardTab({ trends, onViewDetail, loading, fetching, onFetchYouTube }: Props) {
  const top5 = [...trends].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);
  const isEmpty = !loading && trends.length === 0;

  // Fetch TikTok viral videos from DB (already cached from Apify)
  const { data: tiktokVideos } = useQuery({
    queryKey: ["dashboard-tiktok-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tiktok_viral_videos" as any)
        .select("*")
        .order("play_count", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  // Compute TikTok KPIs from cached data
  const ttVideos = tiktokVideos || [];
  const ttTotalViews = ttVideos.reduce((s, v) => s + (v.play_count || 0), 0);
  const ttTotalLikes = ttVideos.reduce((s, v) => s + (v.like_count || 0), 0);
  const ttAvgEngagement = ttTotalViews > 0
    ? ((ttTotalLikes / ttTotalViews) * 100).toFixed(1)
    : "0";

  // Top hashtags from TikTok videos
  const hashtagCounts: Record<string, number> = {};
  ttVideos.forEach(v => {
    (v.hashtags || []).forEach((tag: string) => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });
  const topHashtags = Object.entries(hashtagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Top musics
  const musicCounts: Record<string, number> = {};
  ttVideos.forEach(v => {
    if (v.music_name) {
      musicCounts[v.music_name] = (musicCounts[v.music_name] || 0) + 1;
    }
  });
  const topMusics = Object.entries(musicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Top 5 TikTok videos
  const topTikToks = ttVideos.slice(0, 5);

  const kpis = [
    { label: "Trends YouTube", value: trends.length, icon: Eye, color: "text-red-400" },
    { label: "TikToks Virais", value: ttVideos.length, icon: Play, color: "text-primary" },
    { label: "Views TikTok", value: formatCount(ttTotalViews), icon: TrendingUp, color: "text-emerald-400" },
    { label: "Engajamento TikTok", value: `${ttAvgEngagement}%`, icon: Heart, color: "text-pink-400" },
    { label: "Acelerando", value: trends.filter(t => t.status === "subindo").length, icon: Zap, color: "text-blue-400" },
    { label: "Oportunidades", value: trends.filter(t => t.commercePotentialScore >= 70).length, icon: ShoppingCart, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 flex-1">
          {kpis.map(k => (
            <Card key={k.label} className="glass-card">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <k.icon className={`w-4 h-4 ${k.color}`} />
                  <span className="text-[11px] text-muted-foreground">{k.label}</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{k.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        {onFetchYouTube && (
          <Button variant="outline" size="sm" onClick={onFetchYouTube} disabled={fetching} className="shrink-0 gap-2">
            {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4 text-red-500" />}
            {fetching ? "Buscando..." : "Atualizar YouTube"}
          </Button>
        )}
      </div>

      {/* TikTok Insights Row */}
      {ttVideos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top TikToks */}
          <Card className="glass-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" />
                Top TikToks Virais da Semana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topTikToks.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <span className="text-sm font-bold text-primary w-5 text-center">{i + 1}</span>
                  {v.cover_url ? (
                    <img src={v.cover_url} alt="" className="w-10 h-14 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-14 rounded bg-muted flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">@{v.author_username || v.author_name || "?"}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{v.description || "Sem descrição"}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" />{formatCount(v.play_count || 0)}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatCount(v.like_count || 0)}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{formatCount(v.comment_count || 0)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Hashtags + Músicas */}
          <div className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  Hashtags em Alta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {topHashtags.map(([tag, count]) => (
                    <Badge key={tag} variant="secondary" className="text-xs gap-1">
                      #{tag}
                      <span className="text-muted-foreground">({count})</span>
                    </Badge>
                  ))}
                  {topHashtags.length === 0 && (
                    <p className="text-xs text-muted-foreground">Sem hashtags ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  Músicas Populares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {topMusics.map(([name, count], i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-primary font-medium">{i + 1}.</span>
                    <span className="truncate flex-1 text-foreground">{name}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{count}x</Badge>
                  </div>
                ))}
                {topMusics.length === 0 && (
                  <p className="text-xs text-muted-foreground">Sem dados de música</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Charts */}
      {!isEmpty && <RadarCharts trends={trends} />}

      {/* Top YouTube Trends */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">🔥 Top Trends YouTube</h3>
        {loading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Carregando trends...</div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <Youtube className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">Nenhuma trend do YouTube ainda</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique em <span className="font-semibold text-red-500">"Atualizar YouTube"</span> para buscar.
              </p>
            </div>
            {onFetchYouTube && (
              <Button onClick={onFetchYouTube} disabled={fetching} className="gap-2">
                {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
                {fetching ? "Buscando..." : "Buscar Trends"}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {top5.map((t, i) => (
              <TrendCard key={t.id} trend={t} rank={i + 1} onViewDetail={onViewDetail} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
