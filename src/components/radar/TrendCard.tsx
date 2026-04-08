import { TrendStatusBadge } from "./TrendStatusBadge";
import { RiskBadge } from "./RiskBadge";
import { ScoreBar } from "./ScoreBar";
import { Badge } from "@/components/ui/badge";
import { sourceLabels, categoryLabels } from "@/data/radarMocks";
import type { Trend } from "@/types/radar";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  trend: Trend;
  onViewDetail: (t: Trend) => void;
  rank?: number;
}

export function TrendCard({ trend, onViewDetail, rank }: Props) {
  const sources = [...new Set(trend.sourceSignals.map(s => s.source))];

  return (
    <div
      className="glass-card-premium group cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_8px_40px_hsl(263_70%_58%/0.15)]"
      onClick={() => onViewDetail(trend)}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {rank !== undefined && (
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
                <span className="text-sm font-bold text-primary-foreground">{rank}</span>
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate text-sm">{trend.label}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50">{categoryLabels[trend.category]}</Badge>
                <TrendStatusBadge status={trend.status} />
                <RiskBadge score={trend.riskScore} />
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-[hsl(280_80%_65%)]">
              {trend.overallScore}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</span>
          </div>
        </div>

        <div className="space-y-2">
          <ScoreBar score={trend.velocityScore} label="Velocidade" />
          <ScoreBar score={trend.viralPotentialScore} label="Viral" />
          <ScoreBar score={trend.commercePotentialScore} label="Comercial" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex gap-1">
            {sources.map(s => (
              <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0 bg-secondary/50">{sourceLabels[s]}</Badge>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 gap-1">
            <Eye className="w-3 h-3" /> Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}
