import { useState } from "react";
import { FileSearch, Upload, FileText, Sparkles, CheckCircle, AlertTriangle, TrendingUp, Clock, Eye, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AnalysisResult {
  id: number;
  title: string;
  date: string;
  score: number;
  hooks: string;
  improvements: number;
  insights: { icon: typeof CheckCircle; color: string; text: string }[];
}

const mockHistory: AnalysisResult[] = [
  {
    id: 1,
    title: "Roteiro: Produtividade 3 métodos",
    date: "09 Fev 2026, 11:30",
    score: 78,
    hooks: "6/8",
    improvements: 3,
    insights: [
      { icon: CheckCircle, color: "text-green-500", text: "O gancho nos primeiros 3 segundos é forte e gera curiosidade" },
      { icon: CheckCircle, color: "text-green-500", text: "Boa utilização de prova social no meio do roteiro" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "O CTA poderia ser mais direto e urgente" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Considere adicionar uma quebra de padrão no segundo 15" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "A transição do gancho para o conteúdo principal pode ser mais fluida" },
    ],
  },
  {
    id: 2,
    title: "Roteiro: Como ganhar dinheiro dormindo",
    date: "08 Fev 2026, 15:12",
    score: 85,
    hooks: "7/8",
    improvements: 2,
    insights: [
      { icon: CheckCircle, color: "text-green-500", text: "Hook muito forte — promessa clara e curiosidade" },
      { icon: CheckCircle, color: "text-green-500", text: "Estrutura de storytelling bem construída" },
      { icon: CheckCircle, color: "text-green-500", text: "Prova social com números reais" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "O vídeo poderia ser 5s mais curto para reter melhor" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Adicione legenda com destaque nas palavras-chave" },
    ],
  },
  {
    id: 3,
    title: "Roteiro: 5 apps que ninguém conhece",
    date: "07 Fev 2026, 09:45",
    score: 62,
    hooks: "4/8",
    improvements: 5,
    insights: [
      { icon: CheckCircle, color: "text-green-500", text: "Tema com alto potencial de busca" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Gancho fraco — não gera curiosidade suficiente" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Falta prova social ou dados concretos" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "CTA genérico — especifique a ação desejada" },
      { icon: AlertTriangle, color: "text-yellow-500", text: "Considere reordenar os apps do mais impactante para o menos" },
    ],
  },
];

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

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Análise de Roteiro</h1>
        </div>
        <p className="text-muted-foreground">Envie seu vídeo ou roteiro e receba insights para viralizar</p>
      </div>

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
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  item.score >= 80 ? "bg-green-500/10" : item.score >= 65 ? "bg-primary/10" : "bg-yellow-500/10"
                }`}>
                  <span className={`text-lg font-bold font-display ${
                    item.score >= 80 ? "text-green-500" : item.score >= 65 ? "text-primary" : "text-yellow-500"
                  }`}>
                    {item.score}%
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3" />
                      {item.hooks} ganchos
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <AlertTriangle className="w-3 h-3" />
                      {item.improvements} melhorias
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
            <h3 className="font-display text-xl font-bold mb-2">Analisando Roteiro...</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              A IA está avaliando seu roteiro para identificar ganchos, potencial viral e sugestões de melhoria
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
                <h2 className="font-display text-xl font-bold">Resultado da Análise</h2>
                <p className="text-xs text-muted-foreground mt-1">{resultToShow.title}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xl font-bold font-display">{resultToShow.score}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Potencial de Viralização</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xl font-bold font-display">{resultToShow.hooks}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Elementos de Gancho</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-xl font-bold font-display">{resultToShow.improvements}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Melhorias Sugeridas</p>
                </div>
              </div>

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
