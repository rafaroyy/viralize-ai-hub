import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Play, Heart, MessageCircle, Share2, Music, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface TikTokVideo {
  id: string;
  external_id: string | null;
  author_name: string | null;
  author_username: string | null;
  author_avatar: string | null;
  description: string | null;
  video_url: string | null;
  cover_url: string | null;
  play_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  duration: number;
  hashtags: string[];
  music_name: string | null;
  posted_at: string | null;
  week_key: string;
  created_at: string;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RadarTikTokTab() {
  const [fetching, setFetching] = useState(false);

  const { data: videos, isLoading, refetch } = useQuery({
    queryKey: ["tiktok-viral-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tiktok_viral_videos" as any)
        .select("*")
        .order("play_count", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as TikTokVideo[];
    },
  });

  const handleFetch = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("apify-tiktok-fetch");
      if (error) throw error;
      toast.success(`${data?.count || 0} vídeos virais atualizados!`);
      refetch();
    } catch (err: any) {
      toast.error("Erro ao buscar vídeos: " + (err.message || "Tente novamente"));
    } finally {
      setFetching(false);
    }
  };

  const weekKey = videos?.[0]?.week_key;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">TikTok Virais 🇧🇷</h2>
          <p className="text-xs text-muted-foreground">
            Top vídeos virais do TikTok Brasil
            {weekKey && <span className="ml-1">• Semana {weekKey}</span>}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleFetch}
          disabled={fetching}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
          {fetching ? "Buscando..." : "Atualizar"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : !videos?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Play className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum vídeo viral encontrado ainda.</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Atualizar" para buscar os vídeos mais virais do TikTok Brasil.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, idx) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {video.author_avatar && (
                        <img
                          src={video.author_avatar}
                          alt={video.author_name || ""}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <CardTitle className="text-sm truncate">
                        @{video.author_username || video.author_name || "desconhecido"}
                      </CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {video.description || "Sem descrição"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Play className="w-3 h-3" />
                    {formatCount(video.play_count)}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Heart className="w-3 h-3" />
                    {formatCount(video.like_count)}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <MessageCircle className="w-3 h-3" />
                    {formatCount(video.comment_count)}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Share2 className="w-3 h-3" />
                    {formatCount(video.share_count)}
                  </Badge>
                  {video.duration > 0 && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      {formatDuration(video.duration)}
                    </Badge>
                  )}
                </div>

                {video.music_name && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Music className="w-3 h-3 shrink-0" />
                    {video.music_name}
                  </p>
                )}

                {video.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {video.hashtags.slice(0, 5).map((tag, i) => (
                      <span key={i} className="text-xs text-primary">#{tag}</span>
                    ))}
                    {video.hashtags.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{video.hashtags.length - 5}</span>
                    )}
                  </div>
                )}

                {video.video_url && (
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver no TikTok
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
