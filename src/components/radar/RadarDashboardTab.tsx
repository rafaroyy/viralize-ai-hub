import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RadarCharts } from "./RadarCharts";
import { TrendCard } from "./TrendCard";
import { Button } from "@/components/ui/button";
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

  const ttVideos = tiktokVideos || [];
  const ttTotalViews = ttVideos.reduce((s, v) => s + (v.play_count || 0), 0);
  const ttTotalLikes = ttVideos.reduce((s, v) => s + (v.like_count || 0), 0);
  const ttAvgEngagement = ttTotalViews > 0 ? ((ttTotalLikes / ttTotalViews) * 100).toFixed(1) : "0";

  const hashtagCounts: Record<string, number> = {};
  ttVideos.forEach(v => {
    (v.hashtags || []).forEach((tag: string) => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });
  const topHashtags = Object.entries(hashtagCounts).sort(([, a], [, b]) => b - a).slice(0, 8);

  const musicCounts: Record<string, number> = {};
  ttVideos.forEach(v => {
    if (v.music_name) musicCounts[v.music_name] = (musicCounts[v.music_name] || 0) + 1;
  });
  const topMusics = Object.entries(musicCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
  const topTikToks = ttVideos.slice(0, 5);

  const kpis = [
    { label: "Trends YouTube", value: trends.length, icon: Eye, accent: "from-red-500/20 to-red-500/5" },
    { label: "TikToks Virais", value: ttVideos.length, icon: Play, accent: "from-primary/20 to-primary/5" },
    { label: "Views TikTok", value: formatCount(ttTotalViews), icon: TrendingUp, accent: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Engajamento", value: `${ttAvgEngagement}%`, icon: Heart, accent: "from-pink-500/20 to-pink-500/5" },
    { label: "Acelerando", value: trends.filter(t => t.status === "subindo").length, icon: Zap, accent: "from-blue-500/20 to-blue-500/5" },
    { label: "Oportunidades", value: trends.filter(t => t.commercePotentialScore >= 70).length, icon: ShoppingCart, accent: "from-amber-500/20 to-amber-500/5" },
  ];

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 flex-1">
          {kpis.map(k => (
            <div key={k.label} className="glass-card-premium group hover:scale-[1.03] transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${k.accent} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center">
                    <k.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">{k.label}</span>
                </div>
                <span className="text-2xl font-bold text-foreground tracking-tight">{k.value}</span>
              </div>
            </div>
          ))}
        </div>
        {onFetchYouTube && (
          <Button variant="outline" size="sm" onClick={onFetchYouTube} disabled={fetching} className="shrink-0 gap-2 border-border/50 hover:border-primary/50 transition-colors">
            {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4 text-red-500" />}
            {fetching ? "Buscando..." : "Atualizar YouTube"}
          </Button>
        )}
      </div>

      {/* TikTok Insights */}
      {ttVideos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card-premium md:col-span-2">
            <div className="p-5">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
                  <Play className="w-3 h-3 text-primary-foreground" />
                </div>
                Top TikToks Virais
              </h3>
              <div className="space-y-1">
                {topTikToks.map((v, i) => (
                  <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/30 transition-colors">
                    <span className="text-sm font-bold text-primary w-5 text-center tabular-nums">{i + 1}</span>
                    {v.cover_url ? (
                      <img src={v.cover_url} alt="" className="w-10 h-14 rounded-lg object-cover shrink-0 border border-border/30" />
                    ) : (
                      <div className="w-10 h-14 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                        <Play className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-foreground">@{v.author_username || v.author_name || "?"}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{v.description || "Sem descrição"}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><Play className="w-3 h-3" />{formatCount(v.play_count || 0)}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatCount(v.like_count || 0)}</span>
                      <span className="flex items-center gap-1 hidden sm:flex"><MessageCircle className="w-3 h-3" />{formatCount(v.comment_count || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card-premium">
              <div className="p-5">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-primary" />
                  Hashtags em Alta
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {topHashtags.map(([tag, count]) => (
                    <Badge key={tag} variant="secondary" className="text-xs gap-1 bg-secondary/50 hover:bg-secondary/80 transition-colors">
                      #{tag}
                      <span className="text-muted-foreground/70">({count})</span>
                    </Badge>
                  ))}
                  {topHashtags.length === 0 && <p className="text-xs text-muted-foreground">Sem hashtags ainda</p>}
                </div>
              </div>
            </div>

            <div className="glass-card-premium">
              <div className="p-5">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                  <Music className="w-4 h-4 text-primary" />
                  Músicas Populares
                </h3>
                <div className="space-y-2">
                  {topMusics.map(([name, count], i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">{i + 1}</span>
                      <span className="truncate flex-1 text-foreground">{name}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0 border-border/40">{count}x</Badge>
                    </div>
                  ))}
                  {topMusics.length === 0 && <p className="text-xs text-muted-foreground">Sem dados de música</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {!isEmpty && <RadarCharts trends={trends} />}

      {/* Top YouTube Trends */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Youtube className="w-3.5 h-3.5 text-red-500" />
          </div>
          Top Trends YouTube
        </h3>
        {loading ? (
          <div className="text-sm text-muted-foreground py-12 text-center">Carregando trends...</div>
        ) : isEmpty ? (
          <div className="glass-card-premium">
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Youtube className="w-8 h-8 text-red-500/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Nenhuma trend do YouTube ainda</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em <span className="font-semibold text-red-500">"Atualizar YouTube"</span> para buscar.
                </p>
              </div>
              {onFetchYouTube && (
                <Button onClick={onFetchYouTube} disabled={fetching} className="gap-2 gradient-primary border-0 shadow-glow">
                  {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
                  {fetching ? "Buscando..." : "Buscar Trends"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {top5.map((t, i) => (
              <TrendCard key={t.id} trend={t} rank={i + 1} onViewDetail={onViewDetail} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
