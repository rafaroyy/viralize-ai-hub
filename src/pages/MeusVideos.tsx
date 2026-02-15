import { useState, useEffect } from "react";
import { api, VideoListItem } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play, Film, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MeusVideos = () => {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoListItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { toast } = useToast();

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const list = await api.videoList(0, 100);
      setVideos(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Erro ao carregar vídeos:", e);
      toast({ title: "Erro", description: "Não foi possível carregar seus vídeos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSelect = async (video: VideoListItem) => {
    if (video.status !== "completed") return;
    setSelectedVideo(video);
    setLoadingPreview(true);
    try {
      const blob = await api.previewVideoBlob(video.job_id);
      setPreviewUrl(blob);
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar o preview.", variant: "destructive" });
      setSelectedVideo(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClose = () => {
    setSelectedVideo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const completedVideos = videos.filter((v) => v.status === "completed");
  const otherVideos = videos.filter((v) => v.status !== "completed");

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Meus Vídeos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {completedVideos.length} vídeo{completedVideos.length !== 1 ? "s" : ""} gerado{completedVideos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchVideos} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Film className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-1">Nenhum vídeo ainda</h2>
          <p className="text-sm text-muted-foreground">Crie seu primeiro vídeo viral na página "Criar Vídeo".</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {completedVideos.map((video) => (
            <VideoThumbnail key={video.job_id} video={video} onClick={() => handleSelect(video)} />
          ))}
          {otherVideos.map((video) => (
            <VideoThumbnail key={video.job_id} video={video} onClick={() => {}} disabled />
          ))}
        </div>
      )}

      {/* Expanded preview dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-black/95 border-border">
          <DialogTitle className="sr-only">Preview do vídeo</DialogTitle>
          {loadingPreview ? (
            <div className="flex items-center justify-center h-[70vh]">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : previewUrl ? (
            <div className="flex flex-col">
              <video
                src={previewUrl}
                controls
                autoPlay
                className="w-full max-h-[75vh] object-contain"
              />
              <div className="p-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedVideo?.job_id?.slice(0, 8)}...
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selectedVideo && api.downloadVideo(selectedVideo.job_id)}
                >
                  Baixar vídeo
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function VideoThumbnail({
  video,
  onClick,
  disabled,
}: {
  video: VideoListItem;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const isCompleted = video.status === "completed";

  useEffect(() => {
    if (!isCompleted) return;
    let revoke = "";
    api.previewVideoBlob(video.job_id).then((url) => {
      revoke = url;
      setThumbUrl(url);
    }).catch(() => {});
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [video.job_id, isCompleted]);

  const dateStr = video.created_at
    ? new Date(video.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-border bg-secondary/50 transition-all hover:border-primary/50 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {thumbUrl ? (
        <video
          src={thumbUrl}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedMetadata={(e) => {
            const vid = e.currentTarget;
            vid.currentTime = 0.5;
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {isCompleted ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground capitalize">{video.status}</span>
            </div>
          )}
        </div>
      )}

      {/* Overlay on hover */}
      {isCompleted && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      )}

      {/* Date badge */}
      {dateStr && (
        <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-md">
          {dateStr}
        </span>
      )}
    </button>
  );
}

export default MeusVideos;
