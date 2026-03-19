import { useState, useRef, useCallback, useEffect } from 'react';
import { Flame, Loader2, TrendingUp, TrendingDown, Lightbulb, Target, Eye, Upload, X, AlertTriangle, CheckCircle2, PlayCircle, Sparkles, FileText, Clock, Hash, Scissors, Download, MessageCircle, History, ChevronDown, ChevronUp, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorProfile } from '@/hooks/useCreatorProfile';
import { generateViralPDF } from '@/lib/generateViralPDF';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SectionAnalysis {
  score: number;
  feedback: string;
  tips: string[];
}

interface VideoIdea {
  title: string;
  description: string;
  hookSuggestion: string;
}

interface PacingCut {
  timestamp: string;
  action: string;
}

interface ScriptBlueprint {
  captions: string[];
  exactHook: string;
  bodyPacing: PacingCut[];
  exactCta: string;
}

interface ViralAnalysis {
  overallScore: number;
  classification: string;
  summary: string;
  hookAnalysis: SectionAnalysis;
  bodyAnalysis: SectionAnalysis;
  ctaAnalysis: SectionAnalysis;
  retentionKillers: string[];
  retentionImprovements: string[];
  strengths: string[];
  weaknesses: string[];
  scriptBlueprint?: ScriptBlueprint;
  viralVideoIdeas: VideoIdea[];
}

interface HistoryItem {
  id: string;
  titulo: string;
  created_at: string;
  payload: any;
}

function getScoreColor(score: number) {
  if (score >= 81) return 'text-green-400';
  if (score >= 61) return 'text-emerald-400';
  if (score >= 31) return 'text-yellow-400';
  return 'text-red-400';
}

function getClassBadgeVariant(classification: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (classification === 'Viral') return 'default';
  if (classification === 'Alto') return 'default';
  if (classification === 'Moderado') return 'secondary';
  return 'destructive';
}

function FormattedText({ text }: { text: string }) {
  const lines = text.split(/(?:^|\n)•\s*/g).filter(Boolean);
  if (lines.length > 1) {
    return (
      <ul className="space-y-2.5">
        {lines.map((line, i) => (
          <li key={i} className="text-sm text-foreground/80 flex gap-2">
            <span className="text-primary shrink-0 mt-0.5">•</span>
            <span><InlineFormatted text={line.trim()} /></span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm text-foreground/80 leading-relaxed"><InlineFormatted text={text} /></p>;
}

function InlineFormatted({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d{2}:\d{2}(?:\s*-\s*\d{2}:\d{2})?\])/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (/^\[\d{2}:\d{2}/.test(part)) {
          return (
            <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono font-medium">
              <Clock className="w-2.5 h-2.5" />
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function deriveClassification(score: number): string {
  if (score >= 81) return 'Mega Viral';
  if (score >= 66) return 'Viral';
  if (score >= 46) return 'Alto';
  if (score >= 26) return 'Moderado';
  return 'Baixo';
}

function normalizeSectionScore(score: number): number {
  if (typeof score !== 'number' || isNaN(score)) return 0;
  if (score <= 10) return score * 10;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function normalizeAnalysis(raw: any): ViralAnalysis {
  const overallScore = raw.overallScore ?? raw.viralScore ?? 0;
  const normalized = {
    ...raw,
    overallScore,
    classification: deriveClassification(overallScore),
    summary: raw.summary ?? '',
    strengths: raw.strengths ?? raw.pontosFortes ?? [],
    weaknesses: raw.weaknesses ?? raw.pontosFracos ?? [],
    retentionKillers: raw.retentionKillers ?? [],
    retentionImprovements: raw.retentionImprovements ?? [],
    hookAnalysis: raw.hookAnalysis ?? { score: 0, feedback: '', tips: [] },
    bodyAnalysis: raw.bodyAnalysis ?? { score: 0, feedback: '', tips: [] },
    ctaAnalysis: raw.ctaAnalysis ?? { score: 0, feedback: '', tips: [] },
    scriptBlueprint: raw.scriptBlueprint ?? {
      captions: raw.roteiroMelhorado?.legendas ?? [],
      exactHook: raw.roteiroMelhorado?.hook ?? '',
      bodyPacing: [],
      exactCta: raw.roteiroMelhorado?.cta ?? '',
    },
    viralVideoIdeas: raw.viralVideoIdeas ?? [],
  };
  normalized.hookAnalysis.score = normalizeSectionScore(normalized.hookAnalysis.score);
  normalized.bodyAnalysis.score = normalizeSectionScore(normalized.bodyAnalysis.score);
  normalized.ctaAnalysis.score = normalizeSectionScore(normalized.ctaAnalysis.score);
  normalized.hookAnalysis.tips = normalized.hookAnalysis.tips ?? [];
  normalized.bodyAnalysis.tips = normalized.bodyAnalysis.tips ?? [];
  normalized.ctaAnalysis.tips = normalized.ctaAnalysis.tips ?? [];
  normalized.scriptBlueprint.bodyPacing = normalized.scriptBlueprint.bodyPacing ?? [];
  normalized.scriptBlueprint.captions = normalized.scriptBlueprint.captions ?? [];
  return normalized;
}

/** Expandable tips section — shows max 3 by default */
function ExpandableTips({ tips }: { tips: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? tips : tips.slice(0, 3);
  const hasMore = tips.length > 3;

  return (
    <div className="space-y-2">
      {visible.map((tip, i) => (
        <div key={i} className="rounded-lg bg-secondary/30 p-3 flex gap-2.5 items-start">
          <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/70 leading-relaxed"><InlineFormatted text={tip} /></p>
        </div>
      ))}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Ver menos</> : <><ChevronDown className="w-3 h-3" /> Ver mais {tips.length - 3} dicas</>}
        </button>
      )}
    </div>
  );
}

const AnalisadorViral = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // History state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const loadHistory = async () => {
    if (!user || historyLoaded) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_history' as any)
        .select('id, titulo, created_at, payload')
        .eq('user_id', String(user.user_id))
        .eq('tipo', 'analise')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setHistoryItems((data as any[]) || []);
      setHistoryLoaded(true);
    } catch {
      toast({ title: 'Erro ao carregar histórico', variant: 'destructive' });
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleHistory = () => {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next && !historyLoaded) loadHistory();
  };

  const loadFromHistory = (item: HistoryItem) => {
    if (!item.payload) return;
    setAnalysis(normalizeAnalysis(item.payload));
    setHistoryOpen(false);
    toast({ title: `Análise "${item.titulo}" carregada` });
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({ title: 'Formato inválido', description: 'Envie um arquivo de vídeo (MP4, MOV, etc.)', variant: 'destructive' });
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'O tamanho máximo é 200MB', variant: 'destructive' });
      return;
    }
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const removeVideo = useCallback(() => {
    setVideoFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [videoPreviewUrl]);

  const uploadVideo = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() || 'mp4';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('videos').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(`Erro no upload: ${error.message}`);
    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(path);
    return urlData.publicUrl;
  };

  // Progress messages cycling
  const progressMessages = [
    'A preparar o ambiente seguro...',
    'Agente a extrair dados para a análise...',
    'Agente a aplicar na análise o Método de viralização...',
    'Refinando insights estratégicos...',
  ];

  useEffect(() => {
    if (!isLoading || isUploading) return;
    let idx = 0;
    setProgressMessage(progressMessages[0]);
    const interval = setInterval(() => {
      idx = Math.min(idx + 1, progressMessages.length - 1);
      setProgressMessage(progressMessages[idx]);
    }, 8000);
    return () => clearInterval(interval);
  }, [isLoading, isUploading]);

  /** Convert analyze-script P-C-R response to ViralAnalysis format */
  const mapScriptToViralAnalysis = (raw: any): any => {
    const positiveInsights = (raw.insights || []).filter((i: any) => i.type === 'positive').map((i: any) => i.text);
    const warningInsights = (raw.insights || []).filter((i: any) => i.type === 'warning').map((i: any) => i.text);
    return {
      overallScore: raw.overallScore ?? 50,
      classification: (raw.overallScore ?? 50) >= 80 ? 'Viral' : (raw.overallScore ?? 50) >= 60 ? 'Alto' : (raw.overallScore ?? 50) >= 40 ? 'Moderado' : 'Baixo',
      summary: raw.emotionalPeak || 'Análise via transcrição (modo alternativo).',
      hookAnalysis: { score: raw.pergunta?.score ?? 0, feedback: raw.pergunta?.feedback ?? '', tips: [] },
      bodyAnalysis: { score: raw.conflito?.score ?? 0, feedback: raw.conflito?.feedback ?? '', tips: [] },
      ctaAnalysis: { score: raw.resposta?.score ?? 0, feedback: raw.resposta?.feedback ?? raw.ctaFeedback ?? '', tips: [] },
      retentionKillers: warningInsights.slice(0, 3),
      retentionImprovements: [],
      strengths: positiveInsights.slice(0, 2),
      weaknesses: warningInsights.slice(0, 2),
      scriptBlueprint: { captions: [], exactHook: '', bodyPacing: [], exactCta: '' },
      viralVideoIdeas: [],
    };
  };

  const runFallbackAnalysis = async (): Promise<any> => {
    setProgressMessage('Modo alternativo: analisando via transcrição...');
    if (videoFile) {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('model_id', 'scribe_v2');
      formData.append('language_code', 'por');

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/analyze-script`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Falha na análise alternativa por transcrição.');
      return await res.json();
    } else {
      const { data, error } = await supabase.functions.invoke('analyze-script', {
        body: { script: description.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    }
  };

  const handleAnalyze = async () => {
    if (!description.trim() && !videoFile) {
      toast({ title: 'Envie um vídeo ou descreva o conteúdo', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setAnalysis(null);
    setProgressMessage('');
    let isFallback = false;
    try {
      let videoUrl = '';
      if (videoFile) {
        setIsUploading(true);
        setProgressMessage('Enviando vídeo...');
        videoUrl = await uploadVideo(videoFile);
        setIsUploading(false);
      }
      const { data, error } = await supabase.functions.invoke('analyze-viral', {
        body: { url: videoUrl, description: description.trim(), isVideoUpload: !!videoFile },
      });
      if (error) throw error;

      let analysisData: any;

      // Check for Gemini quota exceeded → fallback
      if (!data?.success && data?.code === 'GEMINI_QUOTA_EXCEEDED') {
        console.warn('[Fallback] Gemini quota exceeded, using analyze-script fallback...');
        const fallbackRaw = await runFallbackAnalysis();
        analysisData = mapScriptToViralAnalysis(fallbackRaw);
        isFallback = true;
      } else if (!data?.success) {
        throw new Error(data?.error || 'Erro na análise');
      } else {
        analysisData = data.analysis;
      }

      const normalized = normalizeAnalysis(analysisData || {});
      setAnalysis(normalized);

      if (isFallback) {
        toast({
          title: '⚡ Modo alternativo ativo',
          description: 'Análise feita via transcrição. A análise visual será restaurada em breve.',
        });
      }

      // Save to history
      if (user) {
        const titulo = description.trim()
          ? description.trim().slice(0, 80)
          : videoFile?.name || 'Análise de vídeo';
        await supabase.from('user_history' as any).insert({
          user_id: String(user.user_id),
          tipo: 'analise',
          titulo: isFallback ? `[Alt] ${titulo}` : titulo,
          payload: analysisData,
        });
        setHistoryLoaded(false);
      }
    } catch (err: any) {
      toast({ title: 'Erro na análise', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
      setProgressMessage('');
    }
  };

  const handleExportPDF = () => {
    if (!analysis) return;
    setIsExporting(true);
    try {
      generateViralPDF(analysis);
      toast({ title: 'PDF exportado com sucesso!' });
    } catch (err: any) {
      toast({ title: 'Erro ao exportar PDF', description: err.message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-6 py-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              Seu vídeo tem potencial <span className="gradient-text">viral</span>?
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Envie um vídeo MP4 ou descreva seu conteúdo. A IA vai analisar o potencial de viralização.
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              {!videoFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Arraste ou clique para enviar</p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV — máx. 200MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
                      {videoPreviewUrl && (
                        <video src={videoPreviewUrl} className="w-full h-full object-cover" muted />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{videoFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 w-8 h-8" onClick={removeVideo}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">e/ou descreva o conteúdo</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Vídeo mostrando antes e depois de uma reforma de cozinha com música trending..."
                className="min-h-[80px] border-0 bg-secondary/50 rounded-xl resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex-1 h-12 text-base font-semibold gap-2 rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> {progressMessage || 'Analisando...'}
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5" /> Analisar Potencial Viral
                  </>
                )}
              </Button>
              {user && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl shrink-0"
                  onClick={toggleHistory}
                  title="Ver histórico de análises"
                >
                  <History className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* History Section */}
            {historyOpen && (
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" /> Histórico de Análises
                </h3>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : historyItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma análise salva ainda.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {historyItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="w-full text-left rounded-xl bg-secondary/30 hover:bg-secondary/50 p-3 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {item.payload?.overallScore != null && (
                          <span className={`text-sm font-bold shrink-0 ${getScoreColor(item.payload.overallScore)}`}>
                            {item.payload.overallScore}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          {analysis && (
            <div ref={resultsRef} className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Exportar PDF
                </Button>
              </div>

              {/* Score Card */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ScoreRing score={analysis.overallScore} />
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <h2 className="text-2xl font-bold">Potencial Viral</h2>
                      <Badge variant={getClassBadgeVariant(analysis.classification)} className="text-sm">
                        {analysis.classification}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
                  </div>
                </div>
              </div>

              {/* Roteiro Otimizado (formerly Blueprint) */}
              {analysis.scriptBlueprint && (
                <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Roteiro Otimizado</h3>
                      <p className="text-xs text-muted-foreground">Versão melhorada do seu roteiro para viralizar</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" /> Abertura Ideal
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed italic border-l-2 border-primary pl-3">
                      "{analysis.scriptBlueprint.exactHook}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-primary" /> Ritmo do Vídeo
                    </h4>
                    <div className="space-y-2">
                      {analysis.scriptBlueprint.bodyPacing.map((cut, i) => (
                        <div key={i} className="flex gap-3 items-start rounded-lg bg-secondary/30 p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono font-medium shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {cut.timestamp}
                          </span>
                          <p className="text-sm text-foreground/80">{cut.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" /> Encerramento Ideal
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed italic border-l-2 border-primary pl-3">
                      "{analysis.scriptBlueprint.exactCta}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" /> Sugestões de Legenda
                    </h4>
                    <div className="space-y-2">
                      {analysis.scriptBlueprint.captions.map((caption, i) => (
                        <div key={i} className="rounded-lg bg-secondary/30 border border-border/50 p-3">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0 text-xs">
                              Opção {i + 1}
                            </Badge>
                            <p className="text-sm text-foreground/80 leading-relaxed">{caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Hook / Body / CTA Breakdown — Redesigned */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([
                  { data: analysis.hookAnalysis, label: 'Abertura', icon: Eye, desc: 'Os primeiros segundos do vídeo' },
                  { data: analysis.bodyAnalysis, label: 'Conteúdo', icon: PlayCircle, desc: 'O desenvolvimento do vídeo' },
                  { data: analysis.ctaAnalysis, label: 'Encerramento', icon: MessageCircle, desc: 'Como você finaliza o vídeo' },
                ] as const).map(({ data, label, icon: Icon, desc }) => (
                  <div key={label} className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    {/* Header with score */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <h3 className="font-semibold">{label}</h3>
                        </div>
                        <span className={`text-xl font-bold ${getScoreColor(data.score)}`}>{data.score}</span>
                      </div>
                      <Progress value={data.score} className="h-2" />
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Avaliação</span>
                      <FormattedText text={data.feedback} />
                    </div>

                    {/* Divider */}
                    {data.tips.length > 0 && (
                      <>
                        <div className="border-t border-border" />
                        {/* Tips */}
                        <div className="space-y-2.5">
                          <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Como melhorar</span>
                          <ExpandableTips tips={data.tips} />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Retention Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" /> O que mata a retenção
                  </h3>
                  <ul className="space-y-2">
                    {analysis.retentionKillers.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-destructive shrink-0">✗</span>
                        <span><InlineFormatted text={item} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" /> Como melhorar a retenção
                  </h3>
                  <ul className="space-y-2">
                    {analysis.retentionImprovements.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary shrink-0">→</span>
                        <span><InlineFormatted text={item} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strengths / Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-green-400">
                    <TrendingUp className="w-4 h-4" /> Pontos Fortes
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-green-400 shrink-0">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-red-400">
                    <TrendingDown className="w-4 h-4" /> Pontos Fracos
                  </h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-red-400 shrink-0">✗</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Viral Video Ideas */}
              {analysis.viralVideoIdeas && analysis.viralVideoIdeas.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Ideias de Vídeos Virais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.viralVideoIdeas.map((idea, i) => (
                      <div key={i} className="rounded-xl bg-secondary/30 p-4 space-y-2 border border-border/50">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-primary shrink-0" /> {idea.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{idea.description}</p>
                        <div className="rounded-lg bg-primary/10 p-2.5 mt-2">
                          <p className="text-xs font-medium text-primary">🎬 Hook sugerido:</p>
                          <p className="text-xs text-foreground/80 mt-1 italic">"{idea.hookSuggestion}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalisadorViral;
