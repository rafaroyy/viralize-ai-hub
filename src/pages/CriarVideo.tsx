import { useState } from "react";
import { Video, Sparkles, Upload, Play, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

const CriarVideo = () => {
  const [narrationMode, setNarrationMode] = useState("narrated");
  const [scenes, setScenes] = useState([3]);
  const [duration, setDuration] = useState("30");
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");

  return (
    <div className="flex h-screen">
      {/* Left: Form */}
      <div className="flex-1 overflow-auto p-8 animate-fade-in">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold">Criar Vídeo Viral</h1>
            </div>
            <p className="text-muted-foreground">Configure seu vídeo em minutos e obtenha milhares de visualizações!</p>
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
                  <Input defaultValue="Vender curso online de produtividade" />
                </div>
                <div className="space-y-2">
                  <Label>Tema *</Label>
                  <Input defaultValue="Produtividade e foco" />
                </div>
                <div className="space-y-2">
                  <Label>Nicho *</Label>
                  <Input defaultValue="Empreendedorismo digital" />
                </div>
                <div className="space-y-2">
                  <Label>Palavra-chave *</Label>
                  <Input defaultValue="productivity hacks" />
                </div>
              </div>
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                <Sparkles className="w-4 h-4 mr-2" />
                Buscar inspiração
              </Button>
            </section>

            {/* Roteiro */}
            <section className="glass-card p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold">Roteiro</h2>
              <div className="space-y-2">
                <Label>Tipo de Roteiro</Label>
                <Select defaultValue="educativo">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educativo">Educativo com prova social</SelectItem>
                    <SelectItem value="storytelling">Storytelling</SelectItem>
                    <SelectItem value="tutorial">Tutorial passo a passo</SelectItem>
                    <SelectItem value="listicle">Listicle / Top N</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sugestão de Roteiro (Opcional)</Label>
                <Textarea defaultValue="Começar com um gancho impactante sobre como 90% das pessoas perdem tempo com técnicas erradas de produtividade. Mostrar 3 métodos comprovados com provas sociais de resultados reais." className="min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label>Pontos Principais (Opcional)</Label>
                <Textarea defaultValue={"Ponto 1: Gancho — \"Você está perdendo 4h por dia sem saber\"\nPonto 2: Método Pomodoro 2.0 com dados\nPonto 3: CTA — \"Link na bio para o curso completo\""} className="min-h-[80px]" />
              </div>
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
            </section>

            {/* Configurações */}
            <section className="glass-card p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold">Configurações do Vídeo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select defaultValue="pt-br">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-br">🇧🇷 Português (BR)</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duração do vídeo</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 segundos</SelectItem>
                      <SelectItem value="30">30 segundos</SelectItem>
                      <SelectItem value="60">60 segundos</SelectItem>
                      <SelectItem value="90">90 segundos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Número de cenas: {scenes[0]}</Label>
                <Slider value={scenes} onValueChange={setScenes} min={1} max={10} step={1} />
              </div>
            </section>

            {/* Upload */}
            <section className="glass-card p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold">Vídeos Personalizados (Opcional)</h2>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Arraste ou clique para adicionar</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI</p>
              </div>
            </section>

            {/* CTA */}
            <Button size="lg" className="w-full gradient-primary text-primary-foreground font-semibold text-base py-6 shadow-glow hover:opacity-90 transition-opacity">
              <Play className="w-5 h-5 mr-2" />
              Gerar Vídeo
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="w-[380px] border-l border-border bg-secondary/30 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display font-semibold text-sm">Preview</h3>
          <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`p-1.5 rounded-md transition-colors ${previewMode === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          {/* Mock Phone Preview */}
          <div className={`relative transition-all duration-300 ${previewMode === "mobile" ? "w-[220px]" : "w-full"}`}>
            <div className="bg-background rounded-2xl border-2 border-border overflow-hidden aspect-[9/16] shadow-card">
              {/* Mock video content */}
              <div className="h-full flex flex-col relative">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />

                {/* Scene indicators */}
                <div className="relative z-10 flex gap-1 px-3 pt-3">
                  {Array.from({ length: scenes[0] }, (_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i === 0 ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>

                {/* Mock content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-3 animate-pulse-glow">
                    <Play className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="text-xs font-bold font-display leading-tight mb-1">
                    Você está perdendo 4h por dia sem saber
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Cena 1 de {scenes[0]} • {duration}s
                  </p>
                </div>

                {/* Mock captions */}
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
                      <p className="text-xs font-bold text-primary">
                        3 MÉTODOS COMPROVADOS
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        que vão mudar sua rotina
                      </p>
                    </div>
                  </div>
                )}

                {/* Bottom bar */}
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

        {/* Preview info */}
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
            <span className="text-muted-foreground">Idioma</span>
            <span className="font-medium">🇧🇷 Português</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarVideo;
