import { useState, useEffect, useRef, useCallback } from "react";
import { Video, Sparkles, Upload, Play, LogOut, PenLine, Wand2, FileText, ArrowLeft, Crown, ChevronDown, X, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { api, CaptionStyle, JobStatus } from "@/lib/api";

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
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all group"
      >
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
          <Crown className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold leading-tight">{name}</p>
          <p className="text-[10px] text-primary font-medium">
            Pro{videosRemaining !== null ? ` · ${videosRemaining} vídeos` : ""}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
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
  const [duration, setDuration] = useState("30");
  const scenes = [Math.min(Math.floor(Number(duration) / 10), 3)];
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

  // Job state
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch caption styles on mount
  useEffect(() => {
    api.captionStyles().then((data) => {
      setCaptionStyles(data.styles);
      setCaptionStyle(data.default);
    }).catch(() => {});
  }, []);

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
        if (status.status === "completed" || status.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        // keep polling
      }
    }, 3000);
  }, []);

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
        cenas: scenes[0],
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
      toast({ title: "Vídeo enviado!", description: res.message });
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
        cenas: 3,
        aspect_ratio: "9:16",
        usar_legenda_e_fala: narrationMode === "narrated",
        caption_style: captionStyle,
        video_source: manualFiles.length > 0 ? "custom" : "sora",
      };
      const files = manualFiles.length > 0 ? manualFiles : undefined;
      const res = await api.renderVideo(payload, files);
      setJobId(res.job_id);
      setJobStatus({ job_id: res.job_id, status: "pending", progress: 0, message: res.message, created_at: res.created_at, updated_at: res.created_at });
      startPolling(res.job_id);
      toast({ title: "Vídeo enviado!", description: res.message });
    } catch (e) {
      toast({ title: "Erro ao gerar vídeo", description: e instanceof Error ? e.message : "Erro desconhecido", variant: "destructive" });
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
  };

  const videosRemaining = quota?.total?.remaining ?? null;

  // Job status dialog
  const jobDialog = (
    <Dialog open={!!jobId} onOpenChange={(open) => { if (!open) resetJob(); }}>
      <DialogContent className="sm:max-w-md glass-card border-border">
        {jobStatus && (
          <div className="flex flex-col items-center py-6 text-center space-y-4">
            {jobStatus.status === "pending" || jobStatus.status === "processing" ? (
              <>
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse-glow">
                  <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                </div>
                <h3 className="font-display text-xl font-bold">
                  {jobStatus.status === "pending" ? "Na fila..." : "Processando..."}
                </h3>
                <p className="text-sm text-muted-foreground">{jobStatus.message}</p>
                <Progress value={jobStatus.progress} className="w-full" />
                <p className="text-xs text-muted-foreground">{jobStatus.progress}%</p>
              </>
            ) : jobStatus.status === "completed" ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-display text-xl font-bold">Vídeo Pronto!</h3>
                <p className="text-sm text-muted-foreground">{jobStatus.message}</p>
                <Button onClick={handleDownload} className="gradient-primary text-primary-foreground shadow-glow">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Vídeo
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="font-display text-xl font-bold">Erro</h3>
                <p className="text-sm text-destructive">{jobStatus.error || jobStatus.message}</p>
                <Button variant="outline" onClick={resetJob}>Fechar</Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // Caption style selector component
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
      <div className="relative flex h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <FlickeringGrid color="hsl(263 70% 58%)" maxOpacity={0.12} flickerChance={0.1} squareSize={4} gridGap={6} />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

        <div className="relative z-10 flex-1 overflow-auto p-8 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-12 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="font-display text-3xl font-bold">Criar Vídeo Viral</h1>
                </div>
                <p className="text-muted-foreground">Escolha como deseja criar seu vídeo</p>
              </div>
              <UserBadge name={displayName} videosRemaining={videosRemaining} onLogout={handleLogout} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("assisted")}
                className="glass-card p-8 text-left group cursor-pointer transition-colors hover:border-primary/50"
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
                className="glass-card p-8 text-left group cursor-pointer transition-colors hover:border-primary/50"
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
        {jobDialog}
      </div>
    );
  }

  // Manual mode
  if (mode === "manual") {
    return (
      <div className="relative flex h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <FlickeringGrid color="hsl(263 70% 58%)" maxOpacity={0.08} flickerChance={0.08} squareSize={4} gridGap={6} />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />

        <div className="relative z-10 flex-1 overflow-auto p-8 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start justify-between mb-8 gap-4">
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
                  <h1 className="font-display text-3xl font-bold">Script Manual</h1>
                </div>
                <p className="text-muted-foreground">Escreva, envie e gere. Sem complicações.</p>
              </div>
              <UserBadge name={displayName} videosRemaining={videosRemaining} onLogout={handleLogout} />
            </div>

            <div className="space-y-8">
              {/* Script */}
              <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
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
              <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-5">
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
              </motion.section>

              {/* Upload */}
              <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 space-y-4">
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
                  Para melhores resultados, envie <strong className="text-foreground">4 vídeos de 5 segundos</strong> cada. Se não enviar, a IA usará vídeos gerados (Sora).
                </p>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => manualFileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-medium mb-1">Arraste ou clique para adicionar</p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, AVI — até 100MB</p>
                </div>
                <input
                  ref={manualFileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files, true)}
                />
                <FileList files={manualFiles} isManual />
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

        <ManualPreview script={manualScript} duration={duration} narrationMode={narrationMode} />
        {jobDialog}
      </div>
    );
  }

  // Assisted mode
  return (
    <div className="relative flex h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <FlickeringGrid color="hsl(263 70% 58%)" maxOpacity={0.08} flickerChance={0.08} squareSize={4} gridGap={6} />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />

      <div className="relative z-10 flex-1 overflow-auto p-8 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between mb-8 gap-4">
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
                <h1 className="font-display text-3xl font-bold">Criar Vídeo Viral</h1>
              </div>
              <p className="text-muted-foreground">Configure seu vídeo em minutos e obtenha milhares de visualizações!</p>
            </div>
            <UserBadge name={displayName} videosRemaining={videosRemaining} onLogout={handleLogout} />
          </div>

          <div className="space-y-8">
            {/* Informações do Vídeo */}
            <section className="glass-card p-6 space-y-5">
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
                </div>
              </div>
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
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
            <section className="glass-card p-6 space-y-5">
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
            <section className="glass-card p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Configurações do Vídeo
              </h2>

              <div className="space-y-3">
                <Label>Duração e Cenas</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "10", label: "10s", scenes: 1 },
                    { value: "20", label: "20s", scenes: 2 },
                    { value: "30", label: "30s", scenes: 3 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value)}
                      className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                        duration === opt.value
                          ? "border-primary bg-primary/5 shadow-glow"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className={`text-2xl font-bold font-display ${duration === opt.value ? "text-primary" : "text-foreground"}`}>
                        {opt.label}
                      </p>
                      <div className="flex justify-center gap-1 mt-2">
                        {Array.from({ length: opt.scenes }, (_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${duration === opt.value ? "bg-primary" : "bg-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {opt.scenes} {opt.scenes === 1 ? "cena" : "cenas"}
                      </p>
                    </button>
                  ))}
                </div>
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
                <RadioGroup value={videoSource} onValueChange={(v) => setVideoSource(v as "sora" | "custom")} className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${videoSource === "sora" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                    <RadioGroupItem value="sora" />
                    <div>
                      <p className="font-medium text-sm">Gerados pela IA (Sora)</p>
                      <p className="text-xs text-muted-foreground">A IA cria os vídeos automaticamente</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${videoSource === "custom" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                    <RadioGroupItem value="custom" />
                    <div>
                      <p className="font-medium text-sm">Vídeos personalizados (Upload)</p>
                      <p className="text-xs text-muted-foreground">Envie seus próprios vídeos</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </section>

            {/* Upload - only when custom */}
            {videoSource === "custom" && (
              <section className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" />
                    Vídeos Personalizados
                  </h2>
                  <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded-full bg-secondary">
                    {scenes[0]} {scenes[0] === 1 ? "vídeo necessário" : "vídeos necessários"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Envie <strong className="text-foreground">{scenes[0]}</strong> {scenes[0] === 1 ? "vídeo" : "vídeos"} — um para cada cena de 10 segundos.
                </p>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-2" />
                  <p className="text-sm font-medium mb-1">Arraste ou clique para adicionar</p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, AVI — até 100MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <FileList files={uploadedFiles} />
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

      {/* Right: Preview */}
      <div className="relative z-10 w-[380px] border-l border-border bg-secondary/30 backdrop-blur-sm flex flex-col shrink-0">
        <div className="flex items-center px-5 py-4 border-b border-border">
          <h3 className="font-display font-semibold text-sm">Preview</h3>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative w-[220px]">
            <div className="bg-background rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
              <div className="h-full flex flex-col relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
                <div className="relative z-10 flex gap-1 px-3 pt-3">
                  {Array.from({ length: scenes[0] }, (_, i) => (
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
                    Cena 1 de {scenes[0]} • {duration}s
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
        </div>

        <div className="px-5 py-4 border-t border-border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Duração</span>
            <span className="font-medium">{duration} segundos</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Cenas</span>
            <span className="font-medium">{scenes[0]}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Narração</span>
            <span className="font-medium">{narrationMode === "narrated" ? "Com áudio" : "Mudo"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Fonte</span>
            <span className="font-medium">{videoSource === "sora" ? "IA (Sora)" : "Upload"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Idioma</span>
            <span className="font-medium">{idioma === "pt-BR" ? "🇧🇷 Português" : idioma === "en" ? "🇺🇸 English" : "🇪🇸 Español"}</span>
          </div>
        </div>
      </div>
      {jobDialog}
    </div>
  );
};

function ManualPreview({ script, duration, narrationMode }: { script: string; duration: string; narrationMode: string }) {
  return (
    <div className="relative z-10 w-[380px] border-l border-border bg-secondary/30 backdrop-blur-sm flex flex-col shrink-0">
      <div className="flex items-center px-5 py-4 border-b border-border">
        <h3 className="font-display font-semibold text-sm">Preview</h3>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-[220px]">
          <div className="bg-background rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
            <div className="h-full flex flex-col relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />

              <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
                <AnimatePresence mode="wait">
                  {script.trim() ? (
                    <motion.div
                      key="script"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-3"
                    >
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
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto">
                        <PenLine className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Seu roteiro aparecerá aqui...
                      </p>
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

export default CriarVideo;
