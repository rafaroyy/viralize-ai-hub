import { useState } from "react";
import { FileSearch, Upload, FileText, Sparkles, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnaliseRoteiro = () => {
  const [script, setScript] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

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
          onClick={() => setAnalyzed(true)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Analisar Roteiro
        </Button>
      </section>

      {/* Results */}
      {analyzed && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="font-display text-xl font-semibold">Resultado da Análise</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold font-display">78%</p>
              <p className="text-xs text-muted-foreground mt-1">Potencial de Viralização</p>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold font-display">6/8</p>
              <p className="text-xs text-muted-foreground mt-1">Elementos de Gancho</p>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold font-display">3</p>
              <p className="text-xs text-muted-foreground mt-1">Melhorias Sugeridas</p>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-display font-semibold">Insights</h3>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, color: "text-green-500", text: "O gancho nos primeiros 3 segundos é forte e gera curiosidade" },
                { icon: CheckCircle, color: "text-green-500", text: "Boa utilização de prova social no meio do roteiro" },
                { icon: AlertTriangle, color: "text-yellow-500", text: "O CTA poderia ser mais direto e urgente" },
                { icon: AlertTriangle, color: "text-yellow-500", text: "Considere adicionar uma quebra de padrão no segundo 15" },
                { icon: AlertTriangle, color: "text-yellow-500", text: "A transição do gancho para o conteúdo principal pode ser mais fluida" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <item.icon className={`w-5 h-5 ${item.color} mt-0.5 shrink-0`} />
                  <p className="text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnaliseRoteiro;
