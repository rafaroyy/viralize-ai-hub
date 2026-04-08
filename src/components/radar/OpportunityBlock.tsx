import { Badge } from "@/components/ui/badge";
import { Lightbulb, Video, MessageSquare, ShoppingCart, Copy } from "lucide-react";
import type { Opportunity } from "@/types/radar";
import { nicheLabels } from "@/data/radarMocks";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function OpportunityBlock({ opp }: { opp: Opportunity }) {
  const { toast } = useToast();

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado! ✨" });
  };

  const sections = [
    { icon: Lightbulb, color: "text-amber-400", title: "Hooks", items: opp.hooks },
    { icon: Video, color: "text-blue-400", title: "Ideias de Vídeo", items: opp.videoIdeas },
  ];

  return (
    <div className="glass-card-premium group hover:shadow-[0_8px_40px_hsl(263_70%_58%/0.12)] transition-all duration-300">
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-sm">{opp.trendLabel}</h3>
            <Badge variant="outline" className="text-[10px] mt-1.5 border-border/50">{nicheLabels[opp.niche] || opp.niche}</Badge>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-[hsl(280_80%_65%)]">
              {opp.opportunityScore}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</span>
          </div>
        </div>

        {opp.whyNow && (
          <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/30 rounded-lg p-3 border border-border/20">
            💡 {opp.whyNow}
          </p>
        )}

        <div className="space-y-3">
          {sections.map(sec => (
            <div key={sec.title}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <sec.icon className={`w-3.5 h-3.5 ${sec.color}`} />
                  <span className="text-xs font-semibold text-foreground">{sec.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyText(sec.items.join("\n"))}
                >
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
              <div className="space-y-1 pl-5">
                {sec.items.map((item, i) => (
                  <p key={i} className="text-xs text-muted-foreground leading-relaxed">• {item}</p>
                ))}
              </div>
            </div>
          ))}

          {opp.narrative && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-foreground">Narrativa</span>
              </div>
              <p className="text-xs text-muted-foreground pl-5 leading-relaxed">{opp.narrative}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border/20">
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">{opp.suggestedProductKeywords.join(", ")}</span>
            </div>
            <Badge className="text-[10px] bg-primary/15 text-primary border-primary/20 hover:bg-primary/25 transition-colors">
              CTA: {opp.cta}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
