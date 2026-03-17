import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Video, Sparkles, Upload, Play, LogOut, PenLine, Wand2, FileText, ArrowLeft, Crown, ChevronDown, X, Download, Loader2, CheckCircle, AlertCircle, Eye, Smartphone, Search, ExternalLink } from "lucide-react";
import { AiLoader } from "@/components/ui/ai-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { api, CaptionStyle, JobStatus } from "@/lib/api";
import { Slider } from "@/components/ui/slider";
import { VideoUploadCard } from "@/components/ui/video-upload-card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

const MAX_WORDS = 25;

function WordCounter({ text }: { text: string }) {
  const count = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isOver = count > MAX_WORDS;
  return (
    <span className={`text-xs font-medium tabular-nums ${isOver ? "text-destructive" : "text-muted-foreground"}`}>
      {count}/{MAX_WORDS} palavras
    </span>
  );
}

function UserBadge({ name, videosRemaining, onLogout }: { name: string; videosRemaining: number | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-2 sm:px-3 py-2 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all group"
      >
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow shrink-0">
          <Crown className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold leading-tight">{name}</p>
          <p className="text-[10px] text-primary font-medium">
            Pro{videosRemaining !== null ? ` · ${videosRemaining} vídeos` : ""}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform hidden sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg p-1.5 z-50"
          >
            <a
              href="/perfil"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Crown className="w-3.5 h-3.5 text-primary" />
              Meu Perfil
            </a>
            <div className="h-px bg-border my-1" />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da conta
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CriarVideo = () => {
  const [mode, setMode] = useState<"choose" | "assisted" | "manual">("choose");
  const [narrationMode, setNarrationMode] = useState("narrated");
  const [duration, setDuration] = useState("24");
  const scenesCount = Math.ceil(Number(duration) / 8);
  const [manualScript, setManualScript] = useState("");
  const [keyword, setKeyword] = useState("");
  const { user, logout, quota } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const displayName = user?.username ?? user?.email?.split("@")[0] ?? "Usuário";

  // Form fields for assisted mode
  const [objetivo, setObjetivo] = useState("");
  const [tema, setTema] = useState("");
  const [nicho, setNicho] = useState("");
  const [idioma, setIdioma] = useState("pt-BR");
  const [videoSource, setVideoSource] = useState<"sora" | "custom">("sora");

  // Caption styles from API
  const [captionStyles, setCaptionStyles] = useState<CaptionStyle[]>([]);
  const [captionStyle, setCaptionStyle] = useState("karaoke");

  // File uploads
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);
  const [manualFiles, setManualFiles] = useState<File[]>([]);
  const [manualVideoCount, setManualVideoCount] = useState(4);

  // Job state
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Fetch caption styles on mount
  useEffect(() => {
    api.captionStyles().then((data) => {
      setCaptionStyles(data.styles);
      setCaptionStyle(data.default);
    }).catch(() => {});
  }, []);

  const handlePreview = useCallback(async (jobId: string) => {
    setPreviewJobId(jobId);
    setLoadingPreview(true);
    try {
      const url = await api.previewVideoBlob(jobId);
      setPreviewUrl(url);
    } catch {
      toast({ title: "Erro ao carregar preview", variant: "destructive" });
    } finally {
      setLoadingPreview(false);
    }
  }, [toast]);

  const closePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewJobId(null);
  }, [previewUrl]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = useCallback((id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.jobStatus(id);
        setJobStatus(status);
        if (status.status === "completed") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          // Auto-load preview into the card
          handlePreview(id);
        } else if (status.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        // keep polling
      }
    }, 3000);
  }, [handlePreview]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleScriptChange = (value: string) => {
    const words = value.trim().split(/\s+/);
    if (words.length <= MAX_WORDS || value.length < manualScript.length) {
      setManualScript(value);
    }
  };

  const handleFileSelect = (files: FileList | null, isManual = false) => {
    if (!files) return;
    const arr = Array.from(files);
    if (isManual) {
      setManualFiles((prev) => [...prev, ...arr]);
    } else {
      setUploadedFiles((prev) => [...prev, ...arr]);
    }
  };

  const removeFile = (index: number, isManual = false) => {
    if (isManual) {
      setManualFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmitAssisted = async () => {
    if (!objetivo.trim() || !tema.trim() || !nicho.trim()) {
      toast({ title: "Preencha os campos obrigatórios", description: "Objetivo, tema e nicho são obrigatórios.", variant: "destructive" });
      return;
    }
    if (videoSource === "custom" && uploadedFiles.length === 0) {
      toast({ title: "Envie os vídeos", description: "No modo Custom é obrigatório enviar vídeos.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        tema: tema.trim(),
        nicho: nicho.trim(),
        objetivo: objetivo.trim(),
        palavra_chave_global: keyword.trim(),
        idioma,
        duracao: Number(duration),
        cenas: scenesCount,
        aspect_ratio: "9:16",
        usar_legenda_e_fala: narrationMode === "narrated",
        caption_style: captionStyle,
        video_source: videoSource,
      };
      const files = videoSource === "custom" ? uploadedFiles : undefined;
      const res = await api.renderVideo(payload, files);
      setJobId(res.job_id);
      setJobStatus({ job_id: res.job_id, status: "pending", progress: 0, message: res.message, created_at: res.created_at, updated_at: res.created_at });
      startPolling(res.job_id);
    } catch (e) {
      toast({ title: "Erro ao gerar vídeo", description: e instanceof Error ? e.message : "Erro desconhecido", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitManual = async () => {
    if (!manualScript.trim()) {
      toast({ title: "Roteiro vazio", description: "Escreva o roteiro antes de gerar.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        script_mode: "manual",
        manual_script: manualScript.trim(),
        idioma,
        cenas: Number(scenesCount),
        aspect_ratio: "9:16",
        usar_legenda_e_fala: true,
        caption_style: captionStyle,
        video_source: "custom",
      };
      const files = manualFiles.length > 0 ? manualFiles : undefined;
      const res = await api.renderVideo(payload, files);
      setJobId(res.job_id);
      setJobStatus({ job_id: res.job_id, status: "pending", progress: 0, message: res.message, created_at: res.created_at, updated_at: res.created_at });
      startPolling(res.job_id);
    } catch (e: any) {
      const errMsg = String(e?.message || "");
      const is413 = errMsg.includes("413") || (errMsg.includes("Failed to fetch") && manualFiles.length > 0);
      const msg = is413
        ? "Os arquivos enviados são muito grandes. Reduza o tamanho dos vídeos e tente novamente."
        : errMsg || "Erro desconhecido";
      toast({ title: "Erro ao gerar vídeo", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!jobId) return;
    try {
      await api.downloadVideo(jobId);
      toast({ title: "Download iniciado!" });
    } catch (e) {
      toast({ title: "Erro no download", description: e instanceof Error ? e.message : "Erro", variant: "destructive" });
    }
  };

  const resetJob = () => {
    setJobId(null);
    setJobStatus(null);
    if (pollRef.current) clearInterval(pollRef.current);
    // history now lives on /meus-videos
  };

  const videosRemaining = quota?.total?.remaining ?? null;


  const isGenerating = !!jobStatus && (jobStatus.status === "pending" || jobStatus.status === "processing");
  const jobFailed = !!jobStatus && jobStatus.status === "failed";

  // Job status dialog - only for errors now
  const jobDialog = jobFailed ? (
    <Dialog open={true} onOpenChange={() => resetJob()}>
      <DialogContent className="sm:max-w-md glass-card border-border">
        <DialogTitle className="sr-only">Erro</DialogTitle>
        <div className="flex flex-col items-center py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="font-display text-xl font-bold">Erro</h3>
          <p className="text-sm text-destructive">{jobStatus?.error || jobStatus?.message}</p>
          <Button variant="outline" onClick={resetJob}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;

  // Preview dialog (single instance shared across modes)
  const previewDialog = (
    <Dialog open={!!previewJobId} onOpenChange={(open) => { if (!open) closePreview(); }}>
      <DialogContent className="sm:max-w-lg glass-card border-border p-0 overflow-hidden">
        <DialogTitle className="sr-only">Preview do Vídeo</DialogTitle>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm">Preview do Vídeo</h3>
          <div className="flex gap-2">
            {previewJobId && (
              <Button size="sm" onClick={() => { api.downloadVideo(previewJobId); }} className="gradient-primary text-primary-foreground">
                <Download className="w-3.5 h-3.5 mr-1" />
                Baixar
              </Button>
            )}
          </div>
        </div>
        <div className="aspect-[9/16] max-h-[70vh] bg-black flex items-center justify-center mx-auto">
          {loadingPreview ? (
            <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
          ) : previewUrl ? (
            <video src={previewUrl} controls autoPlay playsInline className="w-full h-full object-contain" />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );


  const CaptionStyleSelector = () => (
    <div className="space-y-2">
      <Label>Estilo de Legenda</Label>
      <Select value={captionStyle} onValueChange={setCaptionStyle}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {captionStyles.length > 0 ? captionStyles.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.label}
            </SelectItem>
          )) : (
            <SelectItem value="karaoke">Karaoke</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );

  // File list component
  const InspirationGuide = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3"
    >
      <p className="text-sm font-semibold flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Maximize sua taxa de viralização
      </p>
      <div className="space-y-2.5">
        {[
          { step: 1, icon: <Search className="w-3.5 h-3.5" />, text: "Busque inspiração no TikTok usando a palavra-chave do seu nicho" },
          { step: 2, icon: <Download className="w-3.5 h-3.5" />, text: "Copie o link do vídeo e use o SnapTik para baixar sem marca d'água" },
          { step: 3, icon: <Upload className="w-3.5 h-3.5" />, text: "Faça upload dos vídeos aqui para criar seu vídeo personalizado" },
        ].map(({ step, icon, text }) => (
          <div key={step} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-primary-foreground">{step}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground leading-relaxed">
              {icon}
              <span>{text}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="text-xs border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => window.open("https://snaptik.app", "_blank")}
        >
          <ExternalLink className="w-3 h-3 mr-1.5" />
          Abrir SnapTik
        </Button>
        {keyword.trim() && (
          <Button
            size="sm"
            className="text-xs gradient-primary text-primary-foreground"
            onClick={() => window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(keyword.trim())}`, "_blank")}
          >
            <Search className="w-3 h-3 mr-1.5" />
            Buscar no TikTok
          </Button>
        )}
      </div>
    </motion.div>
  );

  const FileList = ({ files, isManual = false }: { files: File[]; isManual?: boolean }) => (
    files.length > 0 ? (
      <div className="space-y-2 mt-3">
        {files.map((file, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 text-sm">
            <Video className="w-4 h-4 text-primary shrink-0" />
            <span className="flex-1 truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(1)}MB</span>
            <button onClick={() => removeFile(i, isManual)} className="text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    ) : null
  );

  // Mode selection screen
  if (mode === "choose") {
    return (
      <div className="relative flex min-h-screen md:h-screen overflow-x-hidden overflow-y-auto md:overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(hsl(var(--primary)/0.08)_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

        <div className="relative z-10 flex-1 overflow-auto p-4 md:p-8 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-8 md:mb-12 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">Criar Vídeo Viral</h1>
                </div>
                <p className="text-muted-foreground text-sm md:text-base">Escolha como deseja criar seu vídeo</p>
              </div>
              <UserBadge name={displayName} videosRemaining={videosRemaining} onLogout={handleLogout} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("assisted")}
                className="glass-card p-5 md:p-8 text-left group cursor-pointer transition-colors hover:border-primary/50"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-5 shadow-glow group-hover:scale-110 transition-transform">
                  <Wand2 className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Assistente IA</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Configure objetivo, nicho, roteiro e deixe a IA montar tudo para você com opções avançadas.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-primary font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recomendado
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("manual")}
                className="glass-card p-5 md:p-8 text-left group cursor-pointer transition-colors hover:border-primary/50"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <PenLine className="w-7 h-7 text-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Script Manual</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Escreva seu próprio roteiro curto e envie seus vídeos. Controle total e simplicidade.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  Direto ao ponto
                </div>
              </motion.button>
            </div>

          </div>
        </div>

        {previewDialog}

        {jobDialog}
      </div>
    );
  }

  // Manual mode
  if (mode === "manual") {
    return (
      <div className="relative flex min-h-screen md:h-screen overflow-x-hidden overflow-y-auto md:overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(hsl(var(--primary)/0.06)_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />

        <div className="relative z-10 flex-1 overflow-auto p-4 md:p-8 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start justify-between mb-6 md:mb-8 gap-4">
              <div>
                <button
                  onClick={() => setMode("choose")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <PenLine className="w-5 h-5 text-foreground" />
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">Script Manual</h1>
                </div>
                <p className="text-muted-foreground text-sm md:text-base">Escreva, envie e gere. Sem complicações.</p>
              </div>
              <UserBadge name={displayName} videosRemaining={videosRemaining} onLogout={handleLogout} />
            </div>

            <div className="space-y-8">
              {/* Script */}
              <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Seu Roteiro
                  </h2>
                  <WordCounter text={manualScript} />
                </div>
                <Textarea
                  value={manualScript}
                  onChange={(e) => handleScriptChange(e.target.value)}
                  placeholder="Escreva aqui seu roteiro em até 25 palavras..."
                  className="min-h-[140px] text-base leading-relaxed resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Dica: seja direto e impactante. Menos palavras = mais retenção.
                </p>
              </motion.section>

              {/* Narration */}
              <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 md:p-6 space-y-5">
                <h2 className="font-display text-lg font-semibold">Modo de Narração</h2>
                <RadioGroup value={narrationMode} onValueChange={setNarrationMode} className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${narrationMode === "narrated" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                    <RadioGroupItem value="narrated" />
                    <div>
                      <p className="font-medium text-sm">Com narração + legenda</p>
                      <p className="text-xs text-muted-foreground">IA narra e exibe legendas</p>
                    </div>
                  </label>
                </RadioGroup>
                {narrationMode === "narrated" && <CaptionStyleSelector />}
              </motion.section>

              {/* Upload */}
              <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" />
                    Vídeos Personalizados
                  </h2>
                  <span className="text-[10px] text-primary font-medium px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                    ✦ Recomendado: 4 vídeos de 5s
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Para melhores resultados, envie vídeos de <strong className="text-foreground">~5 segundos</strong> cada. Se não enviar, a IA da Viralize gerará os vídeos automaticamente.
                </p>
                <InspirationGuide />
                <div className="space-y-2">
                  <Label>Quantidade de vídeos</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={1}
                      max={6}
                      step={1}
                      value={[manualVideoCount]}
                      onValueChange={([v]) => {
                        setManualVideoCount(v);
                        setManualFiles((prev) => prev.slice(0, v));
                      }}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold text-primary w-6 text-center">{manualVideoCount}</span>
                  </div>
                </div>
                <div className={`grid gap-3 ${manualVideoCount <= 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
                  {Array.from({ length: manualVideoCount }).map((_, i) => (
                    <VideoUploadCard
                      key={i}
                      title={`Vídeo ${i + 1}`}
                      description="~5 segundos"
                      onFileSelect={(file) => {
                        setManualFiles((prev) => {
                          const next = [...prev];
                          next[i] = file;
                          return next;
                        });
                      }}
                      onFileRemove={() => {
                        setManualFiles((prev) => {
                          const next = [...prev];
                          next.splice(i, 1);
                          return next;
                        });
                      }}
                    />
                  ))}
                </div>
              </motion.section>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Button
                  size="lg"
                  disabled={!manualScript.trim() || isSubmitting}
                  onClick={handleSubmitManual}
                  className="w-full gradient-primary text-primary-foreground font-semibold text-base py-6 shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  Gerar Vídeo
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <ManualPreview script={manualScript} duration={duration} narrationMode={narrationMode} isGenerating={isGenerating} jobStatus={jobStatus} previewUrl={previewUrl} loadingPreview={loadingPreview} isMobile={false} />
        <MobilePreviewDrawer
          content={<ManualPreview script={manualScript} duration={duration} narrationMode={narrationMode} isGenerating={isGenerating} jobStatus={jobStatus} previewUrl={previewUrl} loadingPreview={loadingPreview} isMobile={true} />}
        />
        {jobDialog}
      </div>
    );
  }

  // Assisted mode
  return (
    <div className="relative flex min-h-screen md:h-screen overflow-x-hidden overflow-y-auto md:overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(hsl(var(--primary)/0.06)_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />

      <div className="relative z-10 flex-1 overflow-auto p-4 md:p-8 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between mb-6 md:mb-8 gap-4">
            <div>
              <button
                onClick={() => setMode("choose")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">Criar Vídeo Viral</h1>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">Configure seu vídeo em minutos e obtenha milhares de visualizações!</p>
            </div>
            <UserBadge name={displayName} videosRemaining={videosRemaining} onLogout={handleLogout} />
          </div>

          <div className="space-y-8">
            {/* Informações do Vídeo */}
            <section className="glass-card p-4 md:p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Informações do Vídeo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Objetivo *</Label>
                  <Input placeholder="Ex: Vender curso online de produtividade" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tema *</Label>
                  <Input placeholder="Ex: Produtividade e foco" value={tema} onChange={(e) => setTema(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nicho *</Label>
                  <Input placeholder="Ex: Empreendedorismo digital" value={nicho} onChange={(e) => setNicho(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Palavra-chave *</Label>
                  <Input placeholder="Ex: productivity hacks" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                  {keyword.trim() && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-primary flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Encontre vídeos virais, baixe sem marca d'água pelo SnapTik e use aqui!
                    </motion.p>
                  )}
                </div>
              </div>
              <Button
                variant={keyword.trim() ? "default" : "outline"}
                className={keyword.trim()
                  ? "gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-all"
                  : "border-primary/30 text-primary hover:bg-primary/10"
                }
                onClick={() => {
                  const q = encodeURIComponent(keyword.trim());
                  if (q) window.open(`https://www.tiktok.com/search?q=${q}`, "_blank");
                }}
                disabled={!keyword.trim()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Buscar inspiração
              </Button>
            </section>

            {/* Narração */}
            <section className="glass-card p-4 md:p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold">Modo de Narração</h2>
              <RadioGroup value={narrationMode} onValueChange={setNarrationMode} className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${narrationMode === "narrated" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                  <RadioGroupItem value="narrated" />
                  <div>
                    <p className="font-medium text-sm">Com narração + legenda</p>
                    <p className="text-xs text-muted-foreground">IA narra e exibe legendas</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${narrationMode === "muted" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                  <RadioGroupItem value="muted" />
                  <div>
                    <p className="font-medium text-sm">Mudo com texto central</p>
                    <p className="text-xs text-muted-foreground">Texto no centro sem áudio</p>
                  </div>
                </label>
              </RadioGroup>
              {narrationMode === "narrated" && <CaptionStyleSelector />}
            </section>

            {/* Configurações */}
            <section className="glass-card p-4 md:p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Configurações do Vídeo
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Duração do Vídeo
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-display text-primary">{duration}s</span>
                    <span className="text-xs text-muted-foreground">
                      {scenesCount} {scenesCount === 1 ? "cena" : "cenas"}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[Number(duration)]}
                  onValueChange={([v]) => setDuration(String(v))}
                  min={8}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>8s (1 cena)</span>
                  <span>30s ({Math.ceil(30 / 8)} cenas)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cada cena tem ~8 segundos. A quantidade de cenas é calculada automaticamente.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={idioma} onValueChange={setIdioma}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">🇧🇷 Português (BR)</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Video Source */}
              <div className="space-y-3">
                <Label>Fonte dos Vídeos</Label>
                <RadioGroup value={videoSource} onValueChange={(v) => {
                  setVideoSource(v as "sora" | "custom");
                }} className="space-y-3">
                  <label className={`relative flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${videoSource === "sora" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                    <RadioGroupItem value="sora" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Gerados pela IA da Viralize</p>
                      <p className="text-xs text-muted-foreground">A IA cria os vídeos automaticamente</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${videoSource === "custom" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                    <RadioGroupItem value="custom" />
                    <div className="flex-1">
                      <p className="font-medium text-sm flex items-center gap-2">
                        Vídeos personalizados (Upload)
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full gradient-primary text-primary-foreground">🔥 Recomendado</span>
                      </p>
                      <p className="text-xs text-muted-foreground">Maior taxa de viralização com vídeos reais do TikTok</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </section>

            {/* Upload - only when custom */}
            {videoSource === "custom" && (
              <section className="glass-card p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" />
                    Vídeos Personalizados
                  </h2>
                  <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded-full bg-secondary">
                    {scenesCount} {scenesCount === 1 ? "vídeo necessário" : "vídeos necessários"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Envie <strong className="text-foreground">{scenesCount}</strong> {scenesCount === 1 ? "vídeo" : "vídeos"} — um para cada cena de 8 segundos.
                </p>
                <InspirationGuide />
                <div className={`grid gap-3 ${scenesCount <= 2 ? "grid-cols-2" : scenesCount <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
                  {Array.from({ length: scenesCount }, (_, i) => (
                    <VideoUploadCard
                      key={i}
                      title={`Cena ${i + 1}`}
                      description="~8 segundos"
                      onFileSelect={(file) => {
                        setUploadedFiles((prev) => {
                          const next = [...prev];
                          next[i] = file;
                          return next;
                        });
                      }}
                      onFileRemove={() => {
                        setUploadedFiles((prev) => {
                          const next = [...prev];
                          next.splice(i, 1);
                          return next;
                        });
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <Button
              size="lg"
              onClick={handleSubmitAssisted}
              disabled={isSubmitting}
              className="w-full gradient-primary text-primary-foreground font-semibold text-base py-6 shadow-glow hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              Gerar Vídeo
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Preview - hidden on mobile */}
      <div className="relative z-10 w-[380px] border-l border-border bg-secondary/30 backdrop-blur-sm hidden md:flex flex-col shrink-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display font-semibold text-sm">Preview</h3>
          {previewUrl && (
            <Button variant="ghost" size="sm" onClick={closePreview} className="text-xs h-7 px-2">
              <X className="w-3 h-3 mr-1" />
              Fechar
            </Button>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          {previewUrl ? (
            <div className="relative w-[220px]">
              <div className="bg-black rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
                <video src={previewUrl} controls autoPlay playsInline className="w-full h-full object-contain" />
              </div>
            </div>
          ) : isGenerating ? (
            <div className="relative w-[220px]">
              <div className="bg-background rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
                <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
                  <AiLoader />
                  <Progress value={jobStatus?.progress ?? 0} className="w-full" />
                  <p className="text-[10px] text-muted-foreground text-center">{jobStatus?.message || "Preparando..."}</p>
                </div>
              </div>
            </div>
          ) : loadingPreview ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Carregando preview...</p>
            </div>
          ) : (
            <div className="relative w-[220px]">
              <div className="bg-background rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
                <div className="h-full flex flex-col relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
                  <div className="relative z-10 flex gap-1 px-3 pt-3">
                    {Array.from({ length: scenesCount }, (_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i === 0 ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-3 animate-pulse-glow">
                      <Play className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <p className="text-xs font-bold font-display leading-tight mb-1">
                      {tema.trim() || "Seu tema aparecerá aqui"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Cena 1 de {scenesCount} • {duration}s
                    </p>
                  </div>
                  {narrationMode === "narrated" && (
                    <div className="relative z-10 px-3 pb-4">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 text-center">
                        <p className="text-[9px] font-medium">
                          "Descubra os 3 métodos que vão transformar sua produtividade..."
                        </p>
                      </div>
                    </div>
                  )}
                  {narrationMode === "muted" && (
                    <div className="relative z-10 px-3 pb-4">
                      <div className="text-center">
                        <p className="text-xs font-bold text-primary">3 MÉTODOS COMPROVADOS</p>
                        <p className="text-[9px] text-muted-foreground">que vão mudar sua rotina</p>
                      </div>
                    </div>
                  )}
                  <div className="relative z-10 flex items-center gap-3 px-3 pb-3">
                    <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-primary rounded-full" />
                    </div>
                    <span className="text-[8px] text-muted-foreground">0:10/{duration}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Duração</span>
            <span className="font-medium">{duration} segundos</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Cenas</span>
            <span className="font-medium">{scenesCount}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Narração</span>
            <span className="font-medium">{narrationMode === "narrated" ? "Com áudio" : "Mudo"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Fonte</span>
            <span className="font-medium">{videoSource === "sora" ? "IA Viralize" : "Upload"}</span>
          </div>
        </div>
      </div>

      {/* Mobile Preview Drawer for Assisted mode */}
      <MobilePreviewDrawer
        content={
          <div className="flex flex-col items-center p-4">
            <div className="relative w-[200px]">
              <div className="bg-background rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
                <div className="h-full flex flex-col items-center justify-center px-4 text-center">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-3 animate-pulse-glow">
                    <Play className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="text-xs font-bold font-display leading-tight mb-1">
                    {tema.trim() || "Seu tema aparecerá aqui"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {duration}s • {scenesCount} cenas • {narrationMode === "narrated" ? "Com áudio" : "Mudo"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      />


      {jobDialog}
    </div>
  );
};

function MobilePreviewDrawer({ content }: { content: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-glow flex items-center justify-center md:hidden"
      >
        <Smartphone className="w-6 h-6 text-primary-foreground" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Preview</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-auto pb-6">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function ManualPreview({ script, duration, narrationMode, isGenerating, jobStatus, previewUrl, loadingPreview, isMobile = false }: { script: string; duration: string; narrationMode: string; isGenerating: boolean; jobStatus: JobStatus | null; previewUrl: string | null; loadingPreview: boolean; isMobile?: boolean }) {
  if (!isMobile) {
  return (
    <div className="relative z-10 w-[380px] border-l border-border bg-secondary/30 backdrop-blur-sm hidden md:flex flex-col shrink-0">
      <div className="flex items-center px-5 py-4 border-b border-border">
        <h3 className="font-display font-semibold text-sm">Preview</h3>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {previewUrl ? (
          <div className="relative w-[220px]">
            <div className="bg-black rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
              <video src={previewUrl} controls autoPlay playsInline className="w-full h-full object-contain" />
            </div>
          </div>
        ) : isGenerating ? (
          <div className="relative w-[220px]">
            <div className="bg-background rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
              <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
                <AiLoader />
                <Progress value={jobStatus?.progress ?? 0} className="w-full" />
                <p className="text-[10px] text-muted-foreground text-center">{jobStatus?.message || "Preparando..."}</p>
              </div>
            </div>
          </div>
        ) : loadingPreview ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Carregando preview...</p>
          </div>
        ) : (
          <div className="relative w-[220px]">
            <div className="bg-background rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
              <div className="h-full flex flex-col relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
                  <AnimatePresence mode="wait">
                    {script.trim() ? (
                      <motion.div key="script" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-3">
                        {narrationMode === "narrated" ? (
                          <>
                            <p className="text-xs font-bold font-display leading-tight">{script}</p>
                            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2">
                              <p className="text-[9px] font-medium text-muted-foreground italic">"{script}"</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm font-bold text-primary leading-tight">{script}</p>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto">
                          <PenLine className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Seu roteiro aparecerá aqui...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative z-10 flex items-center gap-3 px-3 pb-3">
                  <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full" />
                  </div>
                  <span className="text-[8px] text-muted-foreground">0:00/{duration}s</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-border space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Modo</span>
          <span className="font-medium text-primary">Script Manual</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Duração</span>
          <span className="font-medium">{duration} segundos</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Narração</span>
          <span className="font-medium">{narrationMode === "narrated" ? "Com áudio" : "Mudo"}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Palavras</span>
          <span className="font-medium">{script.trim() ? script.trim().split(/\s+/).length : 0}/{MAX_WORDS}</span>
        </div>
      </div>
    </div>
  );
  }

  // Mobile inline version (used inside Drawer)
  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-[200px]">
        <div className="bg-background rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
          <div className="h-full flex flex-col relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
              <AnimatePresence mode="wait">
                {script.trim() ? (
                  <motion.div key="script" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-3">
                    <p className="text-xs font-bold font-display leading-tight">{script}</p>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto">
                      <PenLine className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Seu roteiro aparecerá aqui...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-1 w-full max-w-[200px]">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Modo</span>
          <span className="font-medium text-primary">Script Manual</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Duração</span>
          <span className="font-medium">{duration}s</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Palavras</span>
          <span className="font-medium">{script.trim() ? script.trim().split(/\s+/).length : 0}/{MAX_WORDS}</span>
        </div>
      </div>
    </div>
  );
}
export default CriarVideo;
