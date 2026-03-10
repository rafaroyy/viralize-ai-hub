import { useState } from "react";
import { FileSearch, Upload, FileText, Sparkles, CheckCircle, AlertTriangle, TrendingUp, Clock, Eye, Loader2, MessageCircle, Zap, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VideoUploadCard } from "@/components/ui/video-upload-card";

interface PCRScore {
  score: number;
  label: string;
  feedback: string;
}

interface AnalysisResult {
  overallScore: number;
  retentionScore: number;
  emotionalPeak: string;
  pergunta: PCRScore;
  conflito: PCRScore;
  resposta: PCRScore;
  insights: { type: "positive" | "warning"; text: string }[];
  ctaFeedback: string;
  transcription?: string;
}

interface HistoryItem extends AnalysisResult {
  id: number;
  title: string;
  date: string;
}

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-script`;

const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 60) return "bg-primary";
    return "bg-yellow-500";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-display font-bold">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

const AnaliseRoteiro = () => {
  const [script, setScript] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [viewingHistory, setViewingHistory] = useState<HistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState("text");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    const isVideo = activeTab === "video";

    if (isVideo && !videoFile) {
      toast({ title: "Nenhum vídeo selecionado", description: "Envie um vídeo para análise.", variant: "destructive" });
      return;
    }
    if (!isVideo && (!script.trim() || script.trim().length < 10)) {
      toast({ title: "Roteiro muito curto", description: "Escreva pelo menos algumas frases para análise.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      let resp: Response;

      if (isVideo && videoFile) {
        const formData = new FormData();
        formData.append("video", videoFile);

        resp = await fetch(ANALYZE_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        });
      } else {
        resp = await fetch(ANALYZE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ script }),
        });
      }

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => null);
        throw new Error(errorData?.error || "Erro ao analisar roteiro");
      }

      const analysis: AnalysisResult = await resp.json();
      setCurrentResult(analysis);

      const title = isVideo
        ? `Vídeo: ${videoFile!.name.slice(0, 35)}...`
        : `Roteiro: ${script.slice(0, 40).trim()}...`;

      const historyItem: HistoryItem = {
        ...analysis,
        id: Date.now(),
        title,
        date: new Date().toLocaleString("pt-BR", {
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        }),
      };
      setHistory((prev) => [historyItem, ...prev]);
      setShowResult(true);
    } catch (e) {
      console.error("Analysis error:", e);
      toast({ title: "Erro na análise", description: e instanceof Error ? e.message : "Erro desconhecido", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resultToShow = viewingHistory || currentResult;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-primary";
    return "text-yellow-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-primary/10";
    return "bg-yellow-500/10";
  };

  const getInsightIcon = (type: string) => {
    return type === "positive" ? CheckCircle : AlertTriangle;
  };

  const getInsightColor = (type: string) => {
    return type === "positive" ? "text-green-500" : "text-yellow-500";
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Análise de Roteiro</h1>
        </div>
        <p className="text-muted-foreground">
          Analise seu roteiro com a metodologia <strong>P–C–R</strong> (Pergunta, Conflito, Resposta) e maximize a retenção
        </p>
      </div>

      {/* Methodology Summary */}
      <section className="glass-card p-4 md:p-5 mb-6">
        <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Metodologia de Viralização: P–C–R
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <HelpCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">P – Pergunta</p>
              <p className="text-xs text-muted-foreground mt-0.5">Gancho que obriga a pessoa a ficar até o final</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Zap className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">C – Conflito</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tensão que aprofunda a dor ou vai contra o senso comum</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <MessageCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">R – Resposta</p>
              <p className="text-xs text-muted-foreground mt-0.5">Entrega clara, direta e aplicável + CTA</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-4 md:p-6 mb-6">
        <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="w-4 h-4" />
              Roteiro Escrito
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload de Vídeo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <Textarea
              placeholder="Exemplo: Você sabia que 90% das pessoas perdem 4 horas por dia com técnicas erradas de produtividade? Nesse vídeo eu vou te mostrar 3 métodos comprovados que aumentaram minha produtividade em 300%..."
              className="min-h-[200px]"
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="video">
            <div className="max-w-xs mx-auto">
              <VideoUploadCard
                title="Upload de Vídeo"
                description="A IA vai transcrever e analisar automaticamente (máx. 25 MB)"
                accept="video/*,audio/*"
                onFileSelect={(file) => {
                  const MAX_SIZE_MB = 300;
                  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                    toast({
                      title: "Arquivo muito grande",
                      description: `O limite é de ${MAX_SIZE_MB} MB. Reduza a resolução ou duração do vídeo.`,
                      variant: "destructive",
                    });
                    return;
                  }
                  setVideoFile(file);
                }}
                onFileRemove={() => setVideoFile(null)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button
          className="mt-4 gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          onClick={handleAnalyze}
          disabled={isLoading || (activeTab === "text" ? !script.trim() : !videoFile)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {activeTab === "video" ? "Transcrever e Analisar" : "Analisar Roteiro"}
        </Button>
      </section>

      {/* Histórico */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Histórico de Análises</h2>

          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="glass-card p-4 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => {
                  setViewingHistory(item);
                  setShowResult(true);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getScoreBg(item.overallScore)}`}>
                    <span className={`text-lg font-bold font-display ${getScoreColor(item.overallScore)}`}>
                      {item.overallScore}%
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        Retenção: {item.retentionScore}%
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" />
                        {item.emotionalPeak}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 shrink-0">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Dialog */}
      <Dialog open={isLoading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md glass-card border-border [&>button]:hidden">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-5 animate-pulse-glow">
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Analisando com P–C–R...</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              A IA está avaliando gancho, conflito, entrega emocional e potencial de retenção do seu roteiro
            </p>
            <div className="flex gap-1 mt-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResult && !isLoading} onOpenChange={(open) => {
        if (!open) {
          setShowResult(false);
          setViewingHistory(null);
        }
      }}>
        <DialogContent className="sm:max-w-2xl glass-card border-border max-h-[90vh] overflow-y-auto">
          {resultToShow && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-bold">Análise P–C–R</h2>
              </div>

              {/* Score Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-4 text-center">
                  <div className={`w-10 h-10 rounded-full ${getScoreBg(resultToShow.overallScore)} flex items-center justify-center mx-auto mb-2`}>
                    <TrendingUp className={`w-5 h-5 ${getScoreColor(resultToShow.overallScore)}`} />
                  </div>
                  <p className="text-xl font-bold font-display">{resultToShow.overallScore}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Score Geral</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className={`w-10 h-10 rounded-full ${getScoreBg(resultToShow.retentionScore)} flex items-center justify-center mx-auto mb-2`}>
                    <Eye className={`w-5 h-5 ${getScoreColor(resultToShow.retentionScore)}`} />
                  </div>
                  <p className="text-xl font-bold font-display">{resultToShow.retentionScore}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Retenção Estimada</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-bold font-display leading-tight">{resultToShow.emotionalPeak}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pico Emocional</p>
                </div>
              </div>
              {/* Transcription (video uploads) */}
              {resultToShow.transcription && (
                <div className="glass-card p-4 space-y-2">
                  <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Transcrição do Vídeo
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {resultToShow.transcription}
                  </p>
                </div>
              )}

              {/* P-C-R Breakdown */}
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-display font-semibold text-sm">Avaliação P–C–R</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <ScoreBar label={resultToShow.pergunta.label} score={resultToShow.pergunta.score} />
                    <p className="text-xs text-muted-foreground pl-1">{resultToShow.pergunta.feedback}</p>
                  </div>

                  <div className="space-y-2">
                    <ScoreBar label={resultToShow.conflito.label} score={resultToShow.conflito.score} />
                    <p className="text-xs text-muted-foreground pl-1">{resultToShow.conflito.feedback}</p>
                  </div>

                  <div className="space-y-2">
                    <ScoreBar label={resultToShow.resposta.label} score={resultToShow.resposta.score} />
                    <p className="text-xs text-muted-foreground pl-1">{resultToShow.resposta.feedback}</p>
                  </div>
                </div>
              </div>

              {/* CTA Feedback */}
              <div className="glass-card p-4 flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Feedback do CTA</p>
                  <p className="text-xs text-muted-foreground mt-1">{resultToShow.ctaFeedback}</p>
                </div>
              </div>

              {/* Insights */}
              <div className="glass-card p-5 space-y-3">
                <h3 className="font-display font-semibold text-sm">Insights</h3>
                <div className="space-y-2">
                  {(resultToShow.insights || []).map((item, i) => {
                    const Icon = getInsightIcon(item.type);
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <Icon className={`w-5 h-5 ${getInsightColor(item.type)} mt-0.5 shrink-0`} />
                        <p className="text-sm">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnaliseRoteiro;
