import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScoreBar } from "./ScoreBar";
import { RiskBadge } from "./RiskBadge";
import type { Trend } from "@/types/radar";
import { Flame, Scissors, ExternalLink, Hash, Lightbulb, TrendingUp, Eye } from "lucide-react";

function calcClipScore(t: Trend): number {
  return Math.round(
    t.velocityScore * 0.35 +
    t.viralPotentialScore * 0.35 +
    t.noveltyScore * 0.2 +
    (100 - t.saturationScore) * 0.1
  );
}

function formatViews(summary: string | undefined): string {
  if (!summary) return "";
  const match = summary.match(/([\d.,]+)\s*(mil|mi|M|K|B)?/i);
  return match ? summary : "";
}

interface Props {
  trends: Trend[];
  onViewDetail: (t: Trend) => void;
}

export function RadarClipadorTab({ trends, onViewDetail }: Props) {
  // Only trends with a YouTube videoId
  const clipTrends = useMemo(() => {
    return trends
      .filter((t) => {
        const payload = t.sourceSignals?.[0] as any;
        const raw = (t as any).raw_payload;
        return raw?.videoId || payload?.url?.includes("youtube");
      })
      .map((t) => ({ ...t, clipScore: calcClipScore(t) }))
      .sort((a, b) => b.clipScore - a.clipScore);
  }, [trends]);

  const hotTrends = useMemo(() => {
    return trends
      .filter((t) => t.riskScore >= 30 || t.status === "pico")
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 10);
  }, [trends]);

  const topForIdeas = useMemo(() => {
    return [...trends]
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 8);
  }, [trends]);

  return (
    <div className="space-y-8">
      {/* Section 1 — Top Videos to Clip */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Top Vídeos para Clipar</h2>
          <Badge variant="secondary" className="text-[10px]">{clipTrends.length} vídeos</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Vídeos ordenados por potencial de viralização ao ser clipado. Quanto maior o score, mais chances de bombar.
        </p>

        {clipTrends.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Nenhum vídeo do YouTube encontrado nas trends atuais. Tente buscar novas trends no Dashboard.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clipTrends.slice(0, 12).map((t) => {
              const raw = (t as any).raw_payload || {};
              const thumbnail = raw.thumbnail || `https://img.youtube.com/vi/${raw.videoId}/hqdefault.jpg`;
              const videoUrl = raw.videoId
                ? `https://www.youtube.com/watch?v=${raw.videoId}`
                : t.sourceSignals?.[0]?.url || "#";
              const channel = raw.channelTitle || "";

              return (
                <Card
                  key={t.id}
                  className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => onViewDetail(t)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {raw.videoId || thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={t.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Scissors className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {/* Clip score badge */}
                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-xs font-bold text-primary">{t.clipScore}</span>
                    </div>
                  </div>

                  <CardContent className="p-3 space-y-2">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                      {t.label}
                    </h3>

                    <div className="flex items-center justify-between gap-2">
                      {channel && (
                        <span className="text-[11px] text-muted-foreground truncate">{channel}</span>
                      )}
                      {t.summary && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                          <Eye className="w-3 h-3" />
                          {formatViews(t.summary) || t.summary}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <ScoreBar label="Clip" value={t.clipScore} />
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 p-1 rounded hover:bg-secondary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2 — Hot Controversies & Mentions */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-destructive" />
          <h2 className="text-base font-bold text-foreground">Polêmicas & Menções Quentes</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Tópicos em pico ou com risco elevado — mencioná-los no vídeo aumenta engajamento e alcance.
        </p>

        {hotTrends.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma polêmica ou tendência em pico no momento.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hotTrends.map((t) => (
              <Card
                key={t.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => onViewDetail(t)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {t.status === "pico" && <Flame className="w-4 h-4 text-orange-400 shrink-0" />}
                      <span className="text-sm font-semibold text-foreground truncate">{t.label}</span>
                    </div>
                    <RiskBadge score={t.riskScore} />
                  </div>

                  {t.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.summary}</p>
                  )}

                  {t.relatedTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.relatedTerms.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] gap-0.5">
                          <Hash className="w-2.5 h-2.5" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Section 3 — Cut Ideas per Trend */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h2 className="text-base font-bold text-foreground">Ideias de Corte por Trend</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Sugestões prontas de menções, ângulos e hashtags para cada trend — use nos seus clips.
        </p>

        {topForIdeas.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma trend disponível para gerar ideias.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {topForIdeas.map((t) => {
              const mentions = t.relatedTerms.slice(0, 5);
              const angles = t.recommendedAngles.slice(0, 4);
              const hashtags = [...t.aliases, ...t.relatedTerms.slice(0, 3)]
                .filter(Boolean)
                .map((h) => h.replace(/\s+/g, "").replace(/^#/, ""))
                .slice(0, 6);

              return (
                <AccordionItem key={t.id} value={t.id} className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                    <div className="flex items-center gap-2 text-left">
                      <span className="truncate">{t.label}</span>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        Score {t.overallScore}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-4">
                    {/* Mentions */}
                    {mentions.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Mencione no seu vídeo
                        </h4>
                        <ul className="space-y-1">
                          {mentions.map((m) => (
                            <li key={m} className="text-sm text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Angles */}
                    {angles.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Ângulos de corte sugeridos
                        </h4>
                        <ul className="space-y-1">
                          {angles.map((a, i) => (
                            <li key={i} className="text-sm text-foreground flex items-start gap-2">
                              <Scissors className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Hashtags */}
                    {hashtags.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Hashtags sugeridas
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {hashtags.map((h) => (
                            <Badge key={h} variant="outline" className="text-[11px]">
                              #{h}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </section>
    </div>
  );
}
