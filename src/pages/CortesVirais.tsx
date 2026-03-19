import { useState, useRef, useEffect, useCallback } from "react";
import { Scissors, Upload, Link2, Play, Pause, Loader2, Sparkles, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { api, getToken } from "@/lib/api";

interface ClipData {
  start_ms: number;
  end_ms: number;
  title: string;
  hook: string;
  viral_score: number;
  reason: string;
  suggested_caption: string;
}

type ProcessStatus = "idle" | "uploading" | "transcribing" | "analyzing" | "done" | "error";

const STEPS: { key: ProcessStatus; label: string }[] = [
  { key: "uploading", label: "Baixando vídeo" },
  { key: "transcribing", label: "Transcrevendo" },
  { key: "analyzing", label: "Analisando momentos virais" },
  { key: "done", label: "Pronto!" },
];

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function ClipCard({
  clip,
  index,
  sourceType,
  sourceUrl,
  videoRef,
  onCreateClip,
}: {
  clip: ClipData;
  index: number;
  sourceType: string;
  sourceUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCreateClip: (clip: ClipData) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const duration = Math.round((clip.end_ms - clip.start_ms) / 1000);
  const youtubeId = sourceType === "youtube" ? getYoutubeId(sourceUrl) : null;

  const handlePreview = () => {
    if (sourceType === "youtube" && youtubeId) {
      const startSec = Math.floor(clip.start_ms / 1000);
      window.open(`https://www.youtube.com/watch?v=${youtubeId}&t=${startSec}s`, "_blank");
      return;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = clip.start_ms / 1000;
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        // Auto-stop at end_ms
        const checkEnd = setInterval(() => {
          if (videoRef.current && videoRef.current.currentTime >= clip.end_ms / 1000) {
            videoRef.current.pause();
            clearInterval(checkEnd);
            setPlaying(false);
          }
        }, 200);
      }
      setPlaying(!playing);
    }
  };

  const scoreColor =
    clip.viral_score >= 80 ? "text-green-500" :
    clip.viral_score >= 60 ? "text-yellow-500" :
    "text-orange-500";

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] shrink-0">
                Clip {index + 1}
              </Badge>
              <span className={`text-lg font-bold ${scoreColor}`}>
                {clip.viral_score}
              </span>
            </div>
            <h4 className="font-semibold text-sm leading-tight">{clip.title}</h4>
          </div>
          <Button size="icon" variant="outline" className="shrink-0" onClick={handlePreview}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatTime(clip.start_ms)} → {formatTime(clip.end_ms)}</span>
          <span className="text-foreground/60">({duration}s)</span>
        </div>

        <Progress value={clip.viral_score} className="h-1.5" />

        <div className="bg-secondary/40 rounded-md p-2.5">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Hook sugerido:</p>
          <p className="text-sm italic">"{clip.hook}"</p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{clip.reason}</p>

        <Button
          className="w-full gradient-primary text-primary-foreground"
          size="sm"
          onClick={() => onCreateClip(clip)}
        >
          <Scissors className="w-3.5 h-3.5 mr-1.5" />
          Criar Corte com Legenda
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CortesVirais() {
  const { user } = useAuth();
  const [inputMode, setInputMode] = useState<"youtube" | "upload">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [clips, setClips] = useState<ClipData[]>([]);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sourceUrl = inputMode === "youtube" ? youtubeUrl : uploadedVideoUrl || "";
  const sourceType = inputMode;

  const handleAnalyze = async () => {
    if (inputMode === "youtube" && !getYoutubeId(youtubeUrl)) {
      toast.error("Cole uma URL válida do YouTube");
      return;
    }
    if (inputMode === "upload" && !videoFile) {
      toast.error("Selecione um arquivo de vídeo");
      return;
    }

    setStatus("uploading");
    setClips([]);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("user_id", String(user?.user_id ?? ""));

      if (inputMode === "youtube") {
        formData.append("youtube_url", youtubeUrl);
      } else if (videoFile) {
        formData.append("video", videoFile);
      }

      // Use a simulated progress updater while waiting for the synchronous response
      const progressInterval = setInterval(async () => {
        if (!recordId) return;
        const { data } = await supabase
          .from("viral_clips")
          .select("status")
          .eq("id", recordId)
          .single();
        if (data?.status === "transcribing") setStatus("transcribing");
        else if (data?.status === "analyzing") setStatus("analyzing");
      }, 3000);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/viral-clips`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      clearInterval(progressInterval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `Erro ${res.status}`);
      }

      const data = await res.json();
      setRecordId(data.id);

      if (data.status === "done" && data.clips) {
        // Direct result from synchronous processing
        setStatus("done");
        setClips(data.clips as ClipData[]);
        if (data.video_storage_path) {
          const { data: urlData } = supabase.storage
            .from("videos")
            .getPublicUrl(data.video_storage_path);
          setUploadedVideoUrl(urlData.publicUrl);
        }
      } else if (data.status === "error") {
        setStatus("error");
        setErrorMsg(data.error || "Erro no processamento");
      } else {
        // Fallback: poll if somehow we got an intermediate status
        pollStatus(data.id);
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message || "Erro ao processar vídeo");
      toast.error(e.message || "Erro ao processar vídeo");
    }
  };

  const pollStatus = useCallback(async (id: string) => {
    const poll = async () => {
      const { data, error } = await supabase
        .from("viral_clips")
        .select("status, clips, error_message, video_storage_path")
        .eq("id", id)
        .single();

      if (error || !data) return;

      if (data.status === "transcribing") {
        setStatus("transcribing");
      } else if (data.status === "analyzing") {
        setStatus("analyzing");
      } else if (data.status === "done") {
        setStatus("done");
        const parsedClips = (data.clips as unknown as ClipData[]) || [];
        setClips(parsedClips);
        if (data.video_storage_path) {
          const { data: urlData } = supabase.storage
            .from("videos")
            .getPublicUrl(data.video_storage_path);
          setUploadedVideoUrl(urlData.publicUrl);
        }
        return; // stop polling
      } else if (data.status === "error") {
        setStatus("error");
        setErrorMsg(data.error_message || "Erro no processamento");
        return;
      }

      setTimeout(() => poll(), 3000);
    };

    poll();
  }, []);

  const handleCreateClip = async (clip: ClipData) => {
    toast.info("Enviando corte para renderização...");
    try {
      const payload: Record<string, unknown> = {
        modo: "manual",
        prompt: clip.suggested_caption || clip.hook,
        start_ms: clip.start_ms,
        end_ms: clip.end_ms,
      };

      if (inputMode === "youtube") {
        payload.youtube_url = youtubeUrl;
      } else if (uploadedVideoUrl) {
        payload.video_url = uploadedVideoUrl;
      }

      await api.renderVideo(payload);
      toast.success("Corte enviado! Acompanhe em 'Meus Vídeos'");
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar corte");
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.key === status);
  const progressPercent =
    status === "done" ? 100 :
    status === "error" ? 0 :
    currentStepIndex >= 0 ? ((currentStepIndex + 1) / STEPS.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Scissors className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Cortes Virais</h1>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
              BETA
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Transforme vídeos longos em cortes virais com IA
          </p>
        </div>
      </div>

      {/* Input Section */}
      {status === "idle" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "youtube" | "upload")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="youtube" className="gap-2">
                  <Link2 className="w-4 h-4" /> URL do YouTube
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="w-4 h-4" /> Upload de Vídeo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="mt-4">
                <Input
                  placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="text-sm"
                />
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <div
                  className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {videoFile ? videoFile.name : "Clique para selecionar um vídeo (até 500MB)"}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full gradient-primary text-primary-foreground"
              size="lg"
              onClick={handleAnalyze}
              disabled={
                (inputMode === "youtube" && !youtubeUrl) ||
                (inputMode === "upload" && !videoFile)
              }
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analisar Vídeo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Processing */}
      {["uploading", "transcribing", "analyzing"].includes(status) && (
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-lg font-medium">Processando seu vídeo...</p>
              <p className="text-sm text-muted-foreground mt-1">Isso pode levar alguns minutos</p>
            </div>

            <Progress value={progressPercent} className="h-2" />

            <div className="space-y-2">
              {STEPS.map((step, i) => {
                const isActive = step.key === status;
                const isDone = currentStepIndex > i || status === "done";
                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 transition-colors ${
                      isActive ? "bg-primary/10 text-primary font-medium" :
                      isDone ? "text-muted-foreground line-through" :
                      "text-muted-foreground/50"
                    }`}
                  >
                    {isActive && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {isDone && <span className="text-green-500">✓</span>}
                    {!isActive && !isDone && <span className="w-3.5" />}
                    {step.label}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {status === "error" && (
        <Card className="border-destructive/30">
          <CardContent className="p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-destructive" />
            <p className="font-medium">Erro no processamento</p>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <Button variant="outline" onClick={() => { setStatus("idle"); setErrorMsg(""); }}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {status === "done" && clips.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {clips.length} corte{clips.length > 1 ? "s" : ""} identificado{clips.length > 1 ? "s" : ""}
            </h2>
            <Button variant="outline" size="sm" onClick={() => { setStatus("idle"); setClips([]); }}>
              Nova análise
            </Button>
          </div>

          {/* Video player for uploads */}
          {sourceType === "upload" && uploadedVideoUrl && (
            <Card>
              <CardContent className="p-3">
                <video
                  ref={videoRef}
                  src={uploadedVideoUrl}
                  controls
                  className="w-full rounded-lg max-h-[300px]"
                />
              </CardContent>
            </Card>
          )}

          {/* YouTube embed */}
          {sourceType === "youtube" && getYoutubeId(youtubeUrl) && (
            <Card>
              <CardContent className="p-3">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {clips
              .sort((a, b) => b.viral_score - a.viral_score)
              .map((clip, i) => (
                <ClipCard
                  key={i}
                  clip={clip}
                  index={i}
                  sourceType={sourceType}
                  sourceUrl={sourceUrl}
                  videoRef={videoRef}
                  onCreateClip={handleCreateClip}
                />
              ))}
          </div>
        </div>
      )}

      {status === "done" && clips.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum clip viral identificado neste vídeo.</p>
            <Button variant="outline" className="mt-4" onClick={() => setStatus("idle")}>
              Tentar outro vídeo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
