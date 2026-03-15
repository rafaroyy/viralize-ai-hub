import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sourceLabels, nicheLabels, categoryLabels, availableSources, comingSoonSources } from "@/data/radarMocks";
import type { RadarSettings, SourceType, NicheType, TrendCategory } from "@/types/radar";

const defaultSettings: RadarSettings = {
  activeSources: ["youtube"],
  updateFrequency: "1h",
  priorityNiches: ["marketing", "creator-economy", "e-commerce"],
  blockedTerms: [],
  blockedCategories: [],
  scoreSensitivity: 50,
  alertThreshold: 70,
  ingestionMode: "automatico",
  n8nWebhookUrl: "",
};

export function RadarConfiguracoesTab() {
  const [settings, setSettings] = useState<RadarSettings>(defaultSettings);
  const [newTerm, setNewTerm] = useState("");
  const { toast } = useToast();

  const toggleSource = (s: SourceType) => {
    if (comingSoonSources.includes(s)) return;
    const sources = settings.activeSources.includes(s) ? settings.activeSources.filter(x => x !== s) : [...settings.activeSources, s];
    setSettings({ ...settings, activeSources: sources });
  };

  const toggleNiche = (n: NicheType) => {
    const niches = settings.priorityNiches.includes(n) ? settings.priorityNiches.filter(x => x !== n) : [...settings.priorityNiches, n];
    setSettings({ ...settings, priorityNiches: niches });
  };

  const addTerm = () => {
    if (newTerm.trim() && !settings.blockedTerms.includes(newTerm.trim())) {
      setSettings({ ...settings, blockedTerms: [...settings.blockedTerms, newTerm.trim()] });
      setNewTerm("");
    }
  };

  const removeTerm = (t: string) => setSettings({ ...settings, blockedTerms: settings.blockedTerms.filter(x => x !== t) });

  const toggleBlockedCat = (c: TrendCategory) => {
    const cats = settings.blockedCategories.includes(c) ? settings.blockedCategories.filter(x => x !== c) : [...settings.blockedCategories, c];
    setSettings({ ...settings, blockedCategories: cats });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Fontes */}
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Fontes Ativas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(Object.entries(sourceLabels) as [SourceType, string][]).map(([k, v]) => {
            const isComingSoon = comingSoonSources.includes(k);
            return (
              <div key={k} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className={`text-sm ${isComingSoon ? "text-muted-foreground" : ""}`}>{v}</Label>
                  {isComingSoon && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Em breve</Badge>}
                </div>
                <Switch
                  checked={settings.activeSources.includes(k)}
                  onCheckedChange={() => toggleSource(k)}
                  disabled={isComingSoon}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Frequência */}
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Frequência & Modo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Frequência de atualização</Label>
            <Select value={settings.updateFrequency} onValueChange={v => setSettings({ ...settings, updateFrequency: v as RadarSettings["updateFrequency"] })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["15min","30min","1h","6h","12h","24h"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Modo de ingestão</Label>
            <Select value={settings.ingestionMode} onValueChange={v => setSettings({ ...settings, ingestionMode: v as "manual" | "automatico" })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatico">Automático</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Webhook n8n (futuro)</Label>
            <Input className="mt-1" placeholder="https://n8n.exemplo.com/webhook/..." value={settings.n8nWebhookUrl} onChange={e => setSettings({ ...settings, n8nWebhookUrl: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Nichos */}
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Nichos Prioritários</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(nicheLabels) as [NicheType, string][]).map(([k, v]) => (
              <Badge key={k} variant={settings.priorityNiches.includes(k) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleNiche(k)}>
                {v}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score */}
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Sensibilidade do Score</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Sensibilidade: {settings.scoreSensitivity}%</Label>
            <Slider value={[settings.scoreSensitivity]} onValueChange={v => setSettings({ ...settings, scoreSensitivity: v[0] })} max={100} step={5} className="mt-2" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Limiar mínimo para alertas: {settings.alertThreshold}</Label>
            <Slider value={[settings.alertThreshold]} onValueChange={v => setSettings({ ...settings, alertThreshold: v[0] })} max={100} step={5} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Bloqueios */}
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Palavras Bloqueadas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Adicionar termo..." value={newTerm} onChange={e => setNewTerm(e.target.value)} onKeyDown={e => e.key === "Enter" && addTerm()} className="flex-1" />
            <Button size="sm" onClick={addTerm}>Adicionar</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {settings.blockedTerms.map(t => (
              <Badge key={t} variant="secondary" className="text-xs gap-1">
                {t} <X className="w-3 h-3 cursor-pointer" onClick={() => removeTerm(t)} />
              </Badge>
            ))}
            {settings.blockedTerms.length === 0 && <span className="text-xs text-muted-foreground">Nenhum termo bloqueado</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Categorias Bloqueadas</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(categoryLabels) as [TrendCategory, string][]).map(([k, v]) => (
              <Badge key={k} variant={settings.blockedCategories.includes(k) ? "destructive" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleBlockedCat(k)}>
                {v}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="md:col-span-2 flex justify-end">
        <Button className="gap-2" onClick={() => toast({ title: "Configurações salvas!", description: "Suas preferências do Radar foram atualizadas." })}>
          <Save className="w-4 h-4" /> Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
