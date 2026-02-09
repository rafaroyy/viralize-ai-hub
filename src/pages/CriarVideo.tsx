import { useState } from "react";
import { Video, Sparkles, Upload, Play } from "lucide-react";
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

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
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
              <Input placeholder="Ex: Vender curso online" />
            </div>
            <div className="space-y-2">
              <Label>Tema *</Label>
              <Input placeholder="Ex: Produtividade" />
            </div>
            <div className="space-y-2">
              <Label>Nicho *</Label>
              <Input placeholder="Ex: Empreendedorismo digital" />
            </div>
            <div className="space-y-2">
              <Label>Palavra-chave *</Label>
              <Input placeholder="Ex: productivity" />
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
            <Textarea placeholder="Explique a linha geral, ganchos, provas..." className="min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label>Pontos Principais (Opcional)</Label>
            <Textarea placeholder="Ponto 1: Introdução&#10;Ponto 2: Desenvolvimento&#10;Ponto 3: Call to action" className="min-h-[80px]" />
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
  );
};

export default CriarVideo;
