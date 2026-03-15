import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TrendStatusBadge } from "./TrendStatusBadge";
import { RiskBadge } from "./RiskBadge";
import { ScoreBar } from "./ScoreBar";
import { SourcesBlock } from "./SourcesBlock";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { categoryLabels, nicheLabels } from "@/data/radarMocks";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { Trend } from "@/types/radar";
import { Lightbulb, Video, MessageSquare, Target, AlertTriangle } from "lucide-react";

interface Props {
  trend: Trend | null;
  open: boolean;
  onClose: () => void;
}

export function TrendDetailSheet({ trend, open, onClose }: Props) {
  if (!trend) return null;

  const timelineData = trend.timeline?.map(t => ({
    time: new Date(t.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    score: t.score,
  })) || [];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-foreground">{trend.label}</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">{trend.summary}</SheetDescription>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className="text-[10px]">{categoryLabels[trend.category]}</Badge>
                <TrendStatusBadge status={trend.status} />
                <RiskBadge score={trend.riskScore} />
                {trend.niches.map(n => (
                  <Badge key={n} variant="secondary" className="text-[10px]">{nicheLabels[n] || n}</Badge>
                ))}
              </div>
            </SheetHeader>

            {/* Score Geral */}
            <div className="text-center p-4 rounded-xl bg-secondary/50">
              <div className="text-4xl font-bold text-primary font-['Space_Grotesk']">{trend.overallScore}</div>
              <span className="text-xs text-muted-foreground">Score Geral</span>
            </div>

            {/* Scores detalhados */}
            <Section title="Scores Detalhados">
              <div className="space-y-2">
                <ScoreBar score={trend.velocityScore} label="Velocidade" />
                <ScoreBar score={trend.crossSourceScore} label="Cross-source" />
                <ScoreBar score={trend.noveltyScore} label="Novidade" />
                <ScoreBar score={trend.saturationScore} label="Saturação" />
                <ScoreBar score={trend.viralPotentialScore} label="Viral" />
                <ScoreBar score={trend.commercePotentialScore} label="Comercial" />
              </div>
            </Section>

            {/* Timeline */}
            {timelineData.length > 0 && (
              <Section title="Evolução Temporal">
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(263,70%,58%)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(263,70%,58%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(240,5%,55%)" }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: "hsl(240,12%,8%)", border: "1px solid hsl(240,10%,18%)", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="score" stroke="hsl(263,70%,58%)" fill="url(#detailGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            )}

            {/* Fontes */}
            <Section title="Fontes Confirmadas">
              <SourcesBlock signals={trend.sourceSignals} />
            </Section>

            {/* Termos Relacionados */}
            <Section title="Termos Relacionados">
              <div className="flex flex-wrap gap-1.5">
                {trend.relatedTerms.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
            </Section>

            {/* Ângulos */}
            <Section title="Melhores Ângulos" icon={<Target className="w-4 h-4 text-primary" />}>
              <div className="space-y-1.5">
                {trend.recommendedAngles.map((a, i) => <p key={i} className="text-xs text-muted-foreground">• {a}</p>)}
              </div>
            </Section>

            {/* Hooks */}
            <Section title="Hooks Sugeridos" icon={<Lightbulb className="w-4 h-4 text-amber-400" />}>
              <div className="space-y-2">
                {trend.suggestedHooks.map((h, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-secondary/50 text-xs text-foreground">"{h}"</div>
                ))}
              </div>
            </Section>

            {/* Formatos */}
            <Section title="Formatos Recomendados" icon={<Video className="w-4 h-4 text-blue-400" />}>
              <div className="flex flex-wrap gap-1.5">
                {trend.suggestedFormats.map(f => <Badge key={f} variant="outline" className="text-[10px] capitalize">{f}</Badge>)}
              </div>
            </Section>

            {/* CTAs */}
            <Section title="CTAs Sugeridos" icon={<MessageSquare className="w-4 h-4 text-emerald-400" />}>
              <div className="space-y-1.5">
                {trend.suggestedCtas.map((c, i) => <p key={i} className="text-xs text-muted-foreground">• {c}</p>)}
              </div>
            </Section>

            {/* Aliases */}
            {trend.aliases.length > 0 && (
              <Section title="Aliases">
                <div className="flex flex-wrap gap-1.5">
                  {trend.aliases.map(a => <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>)}
                </div>
              </Section>
            )}

            {/* Risco */}
            {trend.riskScore >= 30 && (
              <Section title="Aviso de Risco" icon={<AlertTriangle className="w-4 h-4 text-destructive" />}>
                <p className="text-xs text-muted-foreground">
                  Esta trend tem risco reputacional {trend.riskScore >= 60 ? "alto" : "médio"}.
                  Atenção ao posicionamento e ao tom do conteúdo.
                </p>
              </Section>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Separator />
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}
