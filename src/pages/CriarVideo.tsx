import { useState } from "react";
import { Video, Sparkles, Upload, Play, LogOut, PenLine, Wand2, FileText, ArrowLeft, Crown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

function UserBadge({ name, onLogout }: { name: string; onLogout: () => void }) {
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
          <p className="text-[10px] text-primary font-medium">Pro · 12 vídeos</p>
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.email?.split("@")[0] ?? "Usuário";

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

  // Mode selection screen
  if (mode === "choose") {
    return (
      <div className="relative flex h-screen overflow-hidden">
        {/* Flickering grid background */}
        <div className="absolute inset-0 z-0">
          <FlickeringGrid
            color="hsl(263 70% 58%)"
            maxOpacity={0.12}
            flickerChance={0.1}
            squareSize={4}
            gridGap={6}
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

        <div className="relative z-10 flex-1 overflow-auto p-8 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
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
              <UserBadge name={displayName} onLogout={handleLogout} />
            </div>

            {/* Mode cards */}
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
      </div>
    );
  }

  // Manual mode
  if (mode === "manual") {
    return (
      <div className="relative flex h-screen overflow-hidden">
        {/* Flickering grid background */}
        <div className="absolute inset-0 z-0">
          <FlickeringGrid
            color="hsl(263 70% 58%)"
            maxOpacity={0.08}
            flickerChance={0.08}
            squareSize={4}
            gridGap={6}
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />

        <div className="relative z-10 flex-1 overflow-auto p-8 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
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
              <UserBadge name={displayName} onLogout={handleLogout} />
            </div>

            <div className="space-y-8">
              {/* Script */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 space-y-4"
              >
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
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 space-y-5"
              >
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
              </motion.section>

              {/* Upload */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 space-y-4"
              >
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  Vídeos Personalizados
                </h2>
                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-medium mb-1">Arraste ou clique para adicionar</p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, AVI — até 100MB</p>
                </div>
              </motion.section>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  size="lg"
                  disabled={!manualScript.trim()}
                  className="w-full gradient-primary text-primary-foreground font-semibold text-base py-6 shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Gerar Vídeo
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <ManualPreview script={manualScript} duration={duration} narrationMode={narrationMode} />
      </div>
    );
  }

  // Assisted mode (original)
  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Flickering grid background */}
      <div className="absolute inset-0 z-0">
        <FlickeringGrid
          color="hsl(263 70% 58%)"
          maxOpacity={0.08}
          flickerChance={0.08}
          squareSize={4}
          gridGap={6}
        />
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
            <UserBadge name={displayName} onLogout={handleLogout} />
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
                  <Input placeholder="Ex: Vender curso online de produtividade" />
                </div>
                <div className="space-y-2">
                  <Label>Tema *</Label>
                  <Input placeholder="Ex: Produtividade e foco" />
                </div>
                <div className="space-y-2">
                  <Label>Nicho *</Label>
                  <Input placeholder="Ex: Empreendedorismo digital" />
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
                <Textarea placeholder="Ex: Começar com um gancho impactante sobre como 90% das pessoas perdem tempo com técnicas erradas..." className="min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label>Pontos Principais (Opcional)</Label>
                <Textarea placeholder={"Ex: Ponto 1: Gancho — \"Você está perdendo 4h por dia\"\nPonto 2: Método com dados\nPonto 3: CTA"} className="min-h-[80px]" />
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
                      <SelectItem value="10">10 segundos (1 cena)</SelectItem>
                      <SelectItem value="20">20 segundos (2 cenas)</SelectItem>
                      <SelectItem value="30">30 segundos (3 cenas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Cenas: <strong className="text-foreground">{scenes[0]}</strong> (10s cada)</span>
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
                    Você está perdendo 4h por dia sem saber
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
            <span className="text-muted-foreground">Idioma</span>
            <span className="font-medium">🇧🇷 Português</span>
          </div>
        </div>
      </div>
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
