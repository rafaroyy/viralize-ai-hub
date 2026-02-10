import { useState } from "react";
import { FileSearch, Upload, FileText, Sparkles, CheckCircle, AlertTriangle, TrendingUp, Clock, Eye, Loader2, MessageCircle, Zap, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface PCRScore {
  score: number;
  label: string;
  feedback: string;
}

interface AnalysisResult {
  id: number;
  title: string;
  date: string;
  overallScore: number;
  retentionScore: number;
  emotionalPeak: string;
  pergunta: PCRScore;
  conflito: PCRScore;
  resposta: PCRScore;
  insights: { icon: typeof CheckCircle; color: string; text: string }[];
  ctaFeedback: string;
}

const mockHistory: AnalysisResult[] = [
  {
    id: 1,
    title: "Roteiro: Produtividade 3 métodos",
    date: "09 Fev 2026, 11:30",
    overallScore: 78,
    retentionScore: 72,
    emotionalPeak: "Curiosidade",
    pergunta: {
      score: 85,
      label: "Pergunta (Gancho)",
      feedback: "Bom uso de estatística no gancho. O '90% das pessoas' gera curiosidade e identificação imediata.",
    },
    conflito: {
      score: 68,
      label: "Conflito (Tensão)",
      feedback: "O conflito poderia ser mais profundo. Falta ir contra o senso comum ou mostrar um erro específico que o público comete.",
    },
    resposta: {
      score: 75,
      label: "Resposta (Entrega)",
      feedback: "A promessa de '3 métodos' é clara, mas o CTA poderia ser mais direto e urgente.",
    },
    insights: [
      { icon: CheckCircle, color: "text-green-500", text: "O gancho nos primeiros 3 segundos gera curiosidade com dado impactante" },
      { icon: CheckCircle, color: "text-green-500", text: "A promessa de transformação ('300%') cria desejo de assistir até o final" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Falta um momento de tensão — vá contra o senso comum para criar conflito" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "O CTA precisa ser mais específico: 'Salva esse vídeo' ou 'Comenta se faz sentido'" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Considere adicionar uma quebra de padrão emocional no meio do vídeo" },
    ],
    ctaFeedback: "CTA genérico. Troque por algo direto: 'Segue o perfil pra parte 2' ou 'Salva esse vídeo'.",
  },
  {
    id: 2,
    title: "Roteiro: Como ganhar dinheiro dormindo",
    date: "08 Fev 2026, 15:12",
    overallScore: 85,
    retentionScore: 88,
    emotionalPeak: "Desejo + Choque",
    pergunta: {
      score: 92,
      label: "Pergunta (Gancho)",
      feedback: "Hook muito forte — promessa clara que obriga a pessoa a ficar até o final para saber como.",
    },
    conflito: {
      score: 80,
      label: "Conflito (Tensão)",
      feedback: "Boa construção de tensão com storytelling. Vai contra a crença de que 'precisa trabalhar muito'.",
    },
    resposta: {
      score: 82,
      label: "Resposta (Entrega)",
      feedback: "Resposta clara e aplicável. Prova social com números reais fortalece a entrega.",
    },
    insights: [
      { icon: CheckCircle, color: "text-green-500", text: "Hook irresistível — promessa clara e curiosidade extrema" },
      { icon: CheckCircle, color: "text-green-500", text: "Estrutura P-C-R bem aplicada com storytelling" },
      { icon: CheckCircle, color: "text-green-500", text: "Pico emocional forte: desejo + quebra de crença" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "O vídeo poderia ser 5s mais curto para maximizar retenção" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Adicione legenda com destaque nas palavras-chave emocionais" },
    ],
    ctaFeedback: "CTA funcional. Considere testar 'Comenta EU QUERO' para gerar engajamento.",
  },
  {
    id: 3,
    title: "Roteiro: 5 apps que ninguém conhece",
    date: "07 Fev 2026, 09:45",
    overallScore: 52,
    retentionScore: 45,
    emotionalPeak: "Fraco — sem pico claro",
    pergunta: {
      score: 40,
      label: "Pergunta (Gancho)",
      feedback: "Gancho fraco — não gera curiosidade suficiente. '5 apps' é genérico e não obriga ninguém a ficar.",
    },
    conflito: {
      score: 35,
      label: "Conflito (Tensão)",
      feedback: "Sem conflito real. Não vai contra nenhuma crença, não cria tensão. O vídeo fica 'morno'.",
    },
    resposta: {
      score: 55,
      label: "Resposta (Entrega)",
      feedback: "Os apps são bons, mas a entrega não tem impacto. Falta ordenar do mais impressionante para o menos.",
    },
    insights: [
      { icon: CheckCircle, color: "text-green-500", text: "Tema com alto potencial de busca orgânica" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Gancho não obriga a pessoa a assistir — reformule como pergunta ou promessa" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Vídeo neutro e 'bonitinho' — falta emoção. Precisa de pelo menos 1 pico emocional" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Sem conflito: não desafia nenhuma crença nem mostra o que o público faz errado" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "CTA genérico — especifique a ação: 'Salva pra não esquecer' ou 'Segue pra parte 2'" },
    ],
    ctaFeedback: "CTA inexistente ou genérico. Adicione: 'Salva esse vídeo pra não perder esses apps'.",
  },
];

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
  const [script, setScript] = useState("Você sabia que 90% das pessoas perdem 4 horas por dia com técnicas erradas de produtividade? Nesse vídeo eu vou te mostrar 3 métodos comprovados que aumentaram minha produtividade em 300%.");
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [viewingHistory, setViewingHistory] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentResult(mockHistory[0]);
      setShowResult(true);
    }, 3000);
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

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Análise de Roteiro</h1>
        </div>
        <p className="text-muted-foreground">
          Analise seu roteiro com a metodologia <strong>P–C–R</strong> (Pergunta, Conflito, Resposta) e maximize a retenção
        </p>
      </div>

      {/* Methodology Summary */}
      <section className="glass-card p-5 mb-6">
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

      {/* Input Section */}
      <section className="glass-card p-6 mb-6">
        <Tabs defaultValue="text">
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
              placeholder="Cole seu roteiro aqui para análise..."
              className="min-h-[200px]"
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="video">
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Arraste seu vídeo ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground mt-1">A IA vai transcrever e analisar automaticamente</p>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          className="mt-4 gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Analisar Roteiro
        </Button>
      </section>

      {/* Histórico */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Histórico de Análises</h2>

        <div className="space-y-3">
          {mockHistory.map((item) => (
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

      {/* Loading Dialog */}
      <Dialog open={isLoading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md glass-card border-border [&>button]:hidden">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-5 animate-pulse-glow">
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Analisando com P–C–R...</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Avaliando gancho, conflito, entrega emocional e potencial de retenção do seu roteiro
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
        <DialogContent className="sm:max-w-2xl glass-card border-border max-h-[85vh] overflow-y-auto">
          {resultToShow && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-bold">Análise P–C–R</h2>
                <p className="text-xs text-muted-foreground mt-1">{resultToShow.title}</p>
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
                  {resultToShow.insights.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <item.icon className={`w-5 h-5 ${item.color} mt-0.5 shrink-0`} />
                      <p className="text-sm">{item.text}</p>
                    </div>
                  ))}
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
