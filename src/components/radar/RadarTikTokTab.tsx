import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Play, Heart, MessageCircle, Share2, Music, Clock, RefreshCw, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

function TikTokEmbedDialog({ video, open, onClose }: { video: TikTokVideo | null; open: boolean; onClose: () => void }) {
  if (!video) return null;

  const embedId = video.external_id;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-sm flex items-center gap-2">
            {video.author_avatar && (
              <img src={video.author_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
            )}
            @{video.author_username || video.author_name || "user"}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full" style={{ minHeight: 580 }}>
          {embedId ? (
            <iframe
              src={`https://www.tiktok.com/embed/v2/${embedId}`}
              className="w-full border-0"
              style={{ height: 580 }}
              allow="encrypted-media"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
              <Play className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Embed não disponível</p>
              {video.video_url && (
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir no TikTok
                </a>
              )}
            </div>
          )}
        </div>
        {video.description && (
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground line-clamp-3">{video.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function RadarTikTokTab() {
  const [fetching, setFetching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TikTokVideo | null>(null);

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
  const oldestPosted = videos?.length
    ? videos.reduce((min, v) => {
        const d = v.posted_at ? new Date(v.posted_at).getTime() : Infinity;
        return d < min ? d : min;
      }, Infinity)
    : null;
  const newestPosted = videos?.length
    ? videos.reduce((max, v) => {
        const d = v.posted_at ? new Date(v.posted_at).getTime() : 0;
        return d > max ? d : max;
      }, 0)
    : null;

  const dateRange = oldestPosted && newestPosted && oldestPosted !== Infinity
    ? `${format(new Date(oldestPosted), "dd MMM", { locale: ptBR })} — ${format(new Date(newestPosted), "dd MMM yyyy", { locale: ptBR })}`
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">TikTok Virais 🇧🇷</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-muted-foreground">
              Top vídeos virais do TikTok Brasil
              {weekKey && <span className="ml-1">• Semana {weekKey}</span>}
            </p>
            {dateRange && (
              <Badge variant="outline" className="text-xs gap-1">
                <Calendar className="w-3 h-3" />
                {dateRange}
              </Badge>
            )}
          </div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {videos.map((video, idx) => (
            <Card
              key={video.id}
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Cover / Thumbnail */}
              <div className="relative aspect-[9/14] bg-muted overflow-hidden">
                {video.cover_url ? (
                  <img
                    src={video.cover_url}
                    alt={video.description || "TikTok video"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                {/* Overlay play button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play className="w-7 h-7 text-foreground fill-foreground ml-1" />
                  </div>
                </div>
                {/* Rank badge */}
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-md">
                  {idx + 1}
                </div>
                {/* Duration badge */}
                {video.duration > 0 && (
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0 text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration)}
                  </Badge>
                )}
                {/* Stats overlay */}
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <Badge className="bg-black/70 text-white border-0 text-xs gap-1">
                    <Play className="w-3 h-3" />
                    {formatCount(video.play_count)}
                  </Badge>
                  <Badge className="bg-black/70 text-white border-0 text-xs gap-1">
                    <Heart className="w-3 h-3" />
                    {formatCount(video.like_count)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {video.author_avatar && (
                    <img
                      src={video.author_avatar}
                      alt={video.author_name || ""}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  )}
                  <span className="text-sm font-medium truncate">
                    @{video.author_username || video.author_name || "desconhecido"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {video.description || "Sem descrição"}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <MessageCircle className="w-3 h-3" />
                    {formatCount(video.comment_count)}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Share2 className="w-3 h-3" />
                    {formatCount(video.share_count)}
                  </Badge>
                </div>

                {video.posted_at && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {format(new Date(video.posted_at), "dd 'de' MMM", { locale: ptBR })}
                  </p>
                )}

                {video.music_name && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Music className="w-3 h-3 shrink-0" />
                    {video.music_name}
                  </p>
                )}

                {video.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {video.hashtags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-xs text-primary">#{tag}</span>
                    ))}
                    {video.hashtags.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{video.hashtags.length - 4}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TikTokEmbedDialog
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}
