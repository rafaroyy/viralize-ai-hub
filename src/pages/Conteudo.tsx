import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AiLoader } from "@/components/ui/ai-loader";
import { Lightbulb, Sparkles, Copy, Save, ArrowRight, Filter, Plus, X, FileText } from "lucide-react";

interface ContentIdea {
  title: string;
  angle: string;
  hook: string;
  format: string;
  category: string;
  why_now: string;
  target_emotion: string;
}

interface Script {
  hook: string;
  body: { timestamp: string; text: string; visual_tip?: string }[];
  cta: string;
  captions_suggestions: string[];
  duration_suggestion: string;
  tips?: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  tutorial: "Tutorial",
  storytelling: "Storytelling",
  polêmica: "Polêmica",
  bastidores: "Bastidores",
  lista: "Lista",
  reação: "Reação",
  comparação: "Comparação",
  desafio: "Desafio",
  tendência: "Tendência",
};

const CATEGORY_COLORS: Record<string, string> = {
  tutorial: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  storytelling: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  polêmica: "bg-red-500/10 text-red-400 border-red-500/20",
  bastidores: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  lista: "bg-green-500/10 text-green-400 border-green-500/20",
  reação: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  comparação: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  desafio: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  tendência: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function Conteudo() {
  const { user } = useAuth();
  const { hasProfile } = useCreatorProfile();
  const { toast } = useToast();

  const storageKeyIdeas = user ? `viralize_ideas_${user.user_id}` : null;
  const storageKeyDismissed = user ? `viralize_dismissed_${user.user_id}` : null;

  const [ideas, setIdeas] = useState<ContentIdea[]>(() => {
    if (!storageKeyIdeas) return [];
    try {
      // One-time cleanup of corrupted data
      const CLEANUP_KEY = `viralize_cleanup_v1_${storageKeyIdeas}`;
      if (!localStorage.getItem(CLEANUP_KEY)) {
        localStorage.removeItem(storageKeyIdeas);
        localStorage.setItem(CLEANUP_KEY, "1");
        return [];
      }
      const stored = localStorage.getItem(storageKeyIdeas);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [dismissedIdeas, setDismissedIdeas] = useState<ContentIdea[]>(() => {
    if (!storageKeyDismissed) return [];
    try {
      const CLEANUP_KEY = `viralize_cleanup_v1_${storageKeyDismissed}`;
      if (!localStorage.getItem(CLEANUP_KEY)) {
        localStorage.removeItem(storageKeyDismissed);
        localStorage.setItem(CLEANUP_KEY, "1");
        return [];
      }
      const stored = localStorage.getItem(storageKeyDismissed);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Generate More dialog
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [promptContext, setPromptContext] = useState("");
  const [preferredFormat, setPreferredFormat] = useState("");
  const [preferredTone, setPreferredTone] = useState("");
  const [avoidTopics, setAvoidTopics] = useState("");


  // Persist ideas to localStorage
  useEffect(() => {
    if (storageKeyIdeas) localStorage.setItem(storageKeyIdeas, JSON.stringify(ideas));
  }, [ideas, storageKeyIdeas]);

  useEffect(() => {
    if (storageKeyDismissed) localStorage.setItem(storageKeyDismissed, JSON.stringify(dismissedIdeas));
  }, [dismissedIdeas, storageKeyDismissed]);

  // Customization fields
  const [customTitle, setCustomTitle] = useState("");
  const [customAngle, setCustomAngle] = useState("");
  const [customTone, setCustomTone] = useState("");
  const [customAudience, setCustomAudience] = useState("");

  // Script
  const storageKeyScripts = user ? `viralize_scripts_${user.user_id}` : null;
  const [scriptsMap, setScriptsMap] = useState<Record<string, Script>>(() => {
    if (!storageKeyScripts) return {};
    try {
      const stored = localStorage.getItem(storageKeyScripts);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [script, setScript] = useState<Script | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);

  // Persist scripts to localStorage
  useEffect(() => {
    if (storageKeyScripts) localStorage.setItem(storageKeyScripts, JSON.stringify(scriptsMap));
  }, [scriptsMap, storageKeyScripts]);

  const filteredIdeas = useMemo(() => {
    if (!activeFilter) return ideas;
    return ideas.filter((i) => i.category === activeFilter);
  }, [ideas, activeFilter]);

  const categories = useMemo(() => {
    const cats = new Set(ideas.map((i) => i.category));
    return Array.from(cats);
  }, [ideas]);

  async function generateIdeas(appendMode = false, extraBody: Record<string, unknown> = {}) {
    if (!user) return;
    setLoadingIdeas(true);
    if (!appendMode) {
      setIdeas([]);
      setDismissedIdeas([]);
      setActiveFilter(null);
    }

    try {
      const body: Record<string, unknown> = { user_id: user.user_id, ...extraBody };
      if (appendMode) {
        body.existing_titles = ideas.map((i) => i.title);
        body.dismissed_titles = dismissedIdeas.map((i) => i.title);
      }

      const { data, error } = await supabase.functions.invoke("generate-content-ideas", { body });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newIdeas = data.ideas || [];
      if (appendMode) {
        setIdeas((prev) => [...prev, ...newIdeas]);
      } else {
        setIdeas(newIdeas);
      }

      if (data?.fallback) {
        toast({ title: "Ideias geradas em modo fallback", description: data?.warning || "Sem créditos de IA no momento." });
      } else {
        toast({ title: `${newIdeas.length} ${appendMode ? "novas ideias adicionadas" : "ideias geradas"}!` });
      }
    } catch (e: any) {
      const message = e?.message?.includes("402")
        ? "Sem créditos de IA no momento. Adicione créditos em Settings → Workspace → Usage."
        : e.message;
      toast({ title: "Erro ao gerar ideias", description: message, variant: "destructive" });
    } finally {
      setLoadingIdeas(false);
    }
  }

  function dismissIdea(e: React.MouseEvent, idea: ContentIdea, index: number) {
    e.stopPropagation();
    setDismissedIdeas((prev) => [...prev, idea]);
    setIdeas((prev) => prev.filter((_, i) => i !== index));
    toast({ title: "Ideia descartada", description: "O agente vai aprender suas preferências." });
  }

  function handleGenerateMore() {
    setPromptContext("");
    setPreferredFormat("");
    setPreferredTone("");
    setAvoidTopics("");
    setGenerateDialogOpen(true);
  }

  function confirmGenerateMore() {
    setGenerateDialogOpen(false);
    const extraBody: Record<string, unknown> = {};
    if (promptContext.trim()) extraBody.prompt_context = promptContext.trim();
    if (preferredFormat) extraBody.preferred_format = preferredFormat;
    if (preferredTone.trim()) extraBody.preferred_tone = preferredTone.trim();
    if (avoidTopics.trim()) extraBody.avoid_topics = avoidTopics.trim();
    generateIdeas(true, extraBody);
  }

  function openIdea(idea: ContentIdea, jumpToScript = false) {
    setSelectedIdea(idea);
    setCustomTitle(idea.title);
    setCustomAngle(idea.angle);
    setCustomTone("");
    setCustomAudience("");
    setScript(scriptsMap[idea.title] || null);
    setSheetOpen(true);
  }

  async function generateScript() {
    if (!user || !selectedIdea) return;
    setLoadingScript(true);
    setScript(null);

    try {
      const customizations: Record<string, string> = {};
      if (customTitle !== selectedIdea.title) customizations.title = customTitle;
      if (customAngle !== selectedIdea.angle) customizations.angle = customAngle;
      if (customTone) customizations.tone = customTone;
      if (customAudience) customizations.audience = customAudience;

      const { data, error } = await supabase.functions.invoke("generate-script-from-idea", {
        body: { idea: selectedIdea, customizations, user_id: user.user_id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setScript(data);
      if (selectedIdea) {
        setScriptsMap(prev => ({ ...prev, [selectedIdea.title]: data }));
      }
    } catch (e: any) {
      toast({ title: "Erro ao gerar roteiro", description: e.message, variant: "destructive" });
    } finally {
      setLoadingScript(false);
    }
  }

  function copyScript() {
    if (!script) return;
    const text = `🎬 HOOK: ${script.hook}\n\n${script.body.map((b) => `[${b.timestamp}] ${b.text}${b.visual_tip ? ` (📷 ${b.visual_tip})` : ""}`).join("\n\n")}\n\n📢 CTA: ${script.cta}\n\n📝 Legendas sugeridas:\n${script.captions_suggestions.map((c) => `• ${c}`).join("\n")}\n\n⏱ Duração: ${script.duration_suggestion}${script.tips ? `\n\n💡 Dicas:\n${script.tips.map((t) => `• ${t}`).join("\n")}` : ""}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Roteiro copiado!" });
  }

  async function saveToHistory() {
    if (!script || !user || !selectedIdea) return;
    try {
      await supabase.from("user_history").insert([{
        user_id: String(user.user_id),
        tipo: "roteiro-conteudo",
        titulo: customTitle || selectedIdea.title,
        payload: { idea: selectedIdea, script } as any,
      }]);
      toast({ title: "Salvo no histórico!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  }

  // Empty state
  if (ideas.length === 0 && !loadingIdeas) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <Lightbulb className="w-10 h-10 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Marketplace de Ideias</h1>
          <p className="text-muted-foreground max-w-md">
            A IA vai analisar seu perfil e histórico para criar ideias de vídeos personalizadas para você.
            {!hasProfile && (
              <span className="block mt-2 text-sm text-amber-400">
                💡 Preencha seu perfil de criador para ideias mais precisas.
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => generateIdeas(false)} size="lg" className="gradient-primary text-primary-foreground gap-2">
          <Sparkles className="w-5 h-5" />
          Gerar Ideias de Conteúdo
        </Button>
      </div>
    );
  }

  // Loading
  if (loadingIdeas && ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <AiLoader />
        <p className="text-muted-foreground">Analisando seu perfil e histórico...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Marketplace de Ideias
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {ideas.length} {ideas.length === 1 ? "ideia" : "ideias"} no seu board
            {dismissedIdeas.length > 0 && ` · ${dismissedIdeas.length} descartada${dismissedIdeas.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={handleGenerateMore} disabled={loadingIdeas} className="gap-2 gradient-primary text-primary-foreground">
          {loadingIdeas ? (
            <>Gerando...</>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Gerar +3 Ideias
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(null)}
            className="gap-1"
          >
            <Filter className="w-3 h-3" />
            Todas
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
            >
              {CATEGORY_LABELS[cat] || cat}
            </Button>
          ))}
        </div>
      )}

      {/* Loading indicator for append mode */}
      {loadingIdeas && ideas.length > 0 && (
        <div className="flex items-center justify-center gap-3 py-4 border border-dashed border-primary/30 rounded-lg">
          <AiLoader />
          <p className="text-sm text-muted-foreground">Gerando mais ideias...</p>
        </div>
      )}

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea, i) => {
          const realIndex = ideas.indexOf(idea);
          return (
            <Card
              key={`${idea.title}-${i}`}
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group relative"
              onClick={() => openIdea(idea)}
            >
              {/* Dismiss button */}
              <button
                onClick={(e) => dismissIdea(e, idea, realIndex)}
                className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive/20 text-destructive z-10"
                title="Descartar ideia"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <CardHeader className="pb-3 pr-10">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                    {idea.title}
                  </CardTitle>
                  <Badge variant="outline" className={`text-xs shrink-0 ${CATEGORY_COLORS[idea.category] || ""}`}>
                    {CATEGORY_LABELS[idea.category] || idea.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{idea.angle}</p>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">🎣 Hook: </span>
                    <span className="italic">"{idea.hook}"</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>🎭 {idea.target_emotion}</span>
                    <span>📐 {idea.format}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">⏰ {idea.why_now}</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-xs text-primary">
                    Personalizar e criar roteiro <ArrowRight className="w-3 h-3" />
                  </div>
                  {scriptsMap[idea.title] && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        openIdea(idea, true);
                      }}
                    >
                      <FileText className="w-3 h-3" />
                      Ver Roteiro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generate More Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Gerar Mais Ideias
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Sobre o que você quer criar? *</Label>
              <Textarea
                value={promptContext}
                onChange={(e) => setPromptContext(e.target.value)}
                placeholder="Ex: quero falar sobre como precificar serviços freelancer, algo provocativo..."
                rows={3}
              />
            </div>
            <div>
              <Label>Formato preferido (opcional)</Label>
              <Select value={preferredFormat} onValueChange={setPreferredFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qualquer">Qualquer formato</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tom de voz (opcional)</Label>
              <Input
                value={preferredTone}
                onChange={(e) => setPreferredTone(e.target.value)}
                placeholder="Ex: engraçado, sarcástico, motivacional..."
              />
            </div>
            <div>
              <Label>Evitar algo? (opcional)</Label>
              <Input
                value={avoidTopics}
                onChange={(e) => setAvoidTopics(e.target.value)}
                placeholder="Ex: não quero falar de dropshipping, evitar polêmicas..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={confirmGenerateMore}
              disabled={!promptContext.trim()}
              className="gradient-primary text-primary-foreground gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Gerar +3
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet for customization & script */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Personalizar Ideia</SheetTitle>
          </SheetHeader>

          {selectedIdea && (
            <div className="mt-6 space-y-5">
              {/* Customization form */}
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Ângulo / Abordagem</Label>
                  <Textarea value={customAngle} onChange={(e) => setCustomAngle(e.target.value)} rows={2} />
                </div>
                <div>
                  <Label>Tom de voz (opcional)</Label>
                  <Input
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    placeholder="Ex: engraçado, sério, motivacional..."
                  />
                </div>
                <div>
                  <Label>Público-alvo (opcional)</Label>
                  <Input
                    value={customAudience}
                    onChange={(e) => setCustomAudience(e.target.value)}
                    placeholder="Ex: empreendedores iniciantes..."
                  />
                </div>
              </div>

              <Button
                onClick={generateScript}
                disabled={loadingScript}
                className="w-full gradient-primary text-primary-foreground gap-2"
              >
                {loadingScript ? (
                  <>Gerando roteiro...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Roteiro
                  </>
                )}
              </Button>

              {loadingScript && (
                <div className="flex justify-center py-4">
                  <AiLoader />
                </div>
              )}

              {/* Script result */}
              {script && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">Roteiro Gerado</h3>

                  <div className="rounded-lg bg-secondary/30 p-4 space-y-3">
                    <div>
                      <span className="text-xs font-medium text-primary">🎣 HOOK</span>
                      <p className="text-sm mt-1">{script.hook}</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-medium text-primary">📝 ROTEIRO</span>
                      {script.body.map((block, i) => (
                        <div key={i} className="text-sm border-l-2 border-primary/30 pl-3">
                          <span className="text-xs text-muted-foreground">[{block.timestamp}]</span>
                          <p>{block.text}</p>
                          {block.visual_tip && (
                            <p className="text-xs text-muted-foreground mt-0.5">📷 {block.visual_tip}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <span className="text-xs font-medium text-primary">📢 CTA</span>
                      <p className="text-sm mt-1">{script.cta}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-primary">📝 Legendas sugeridas</span>
                      <ul className="text-sm mt-1 space-y-1">
                        {script.captions_suggestions.map((c, i) => (
                          <li key={i} className="text-muted-foreground">• {c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      ⏱ Duração sugerida: {script.duration_suggestion}
                    </div>

                    {script.tips && script.tips.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-primary">💡 Dicas</span>
                        <ul className="text-sm mt-1 space-y-1">
                          {script.tips.map((t, i) => (
                            <li key={i} className="text-muted-foreground">• {t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyScript} className="gap-1">
                      <Copy className="w-3 h-3" /> Copiar
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveToHistory} className="gap-1">
                      <Save className="w-3 h-3" /> Salvar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
