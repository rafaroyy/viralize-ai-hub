import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Video, MessageSquare, ShoppingCart } from "lucide-react";
import type { Opportunity } from "@/types/radar";
import { nicheLabels } from "@/data/radarMocks";

export function OpportunityBlock({ opp }: { opp: Opportunity }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-sm">{opp.trendLabel}</h3>
            <Badge variant="outline" className="text-[10px] mt-1">{nicheLabels[opp.niche] || opp.niche}</Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary font-['Space_Grotesk']">{opp.opportunityScore}</div>
            <span className="text-[10px] text-muted-foreground">Score</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{opp.whyNow}</p>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-foreground">Hooks</span>
            </div>
            <div className="space-y-1">
              {opp.hooks.map((h, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-5">• {h}</p>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-foreground">Ideias de Vídeo</span>
            </div>
            <div className="space-y-1">
              {opp.videoIdeas.map((v, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-5">• {v}</p>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-foreground">Narrativa</span>
            </div>
            <p className="text-xs text-muted-foreground pl-5">{opp.narrative}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Produtos: {opp.suggestedProductKeywords.join(", ")}</span>
            </div>
            <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">CTA: {opp.cta}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
