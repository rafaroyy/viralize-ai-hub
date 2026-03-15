import { Card, CardContent } from "@/components/ui/card";
import { TrendStatusBadge } from "./TrendStatusBadge";
import { RiskBadge } from "./RiskBadge";
import { ScoreBar } from "./ScoreBar";
import { Badge } from "@/components/ui/badge";
import { sourceLabels, categoryLabels } from "@/data/radarMocks";
import type { Trend } from "@/types/radar";
import { Eye, Zap, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  trend: Trend;
  onViewDetail: (t: Trend) => void;
  rank?: number;
}

export function TrendCard({ trend, onViewDetail, rank }: Props) {
  const sources = [...new Set(trend.sourceSignals.map(s => s.source))];

  return (
    <Card className="glass-card hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => onViewDetail(trend)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {rank !== undefined && (
              <span className="text-lg font-bold text-primary shrink-0">#{rank}</span>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate text-sm">{trend.label}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{categoryLabels[trend.category]}</Badge>
                <TrendStatusBadge status={trend.status} />
                <RiskBadge score={trend.riskScore} />
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-primary">{trend.overallScore}</div>
            <span className="text-[10px] text-muted-foreground">Score</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <ScoreBar score={trend.velocityScore} label="Velocidade" />
          <ScoreBar score={trend.viralPotentialScore} label="Viral" />
          <ScoreBar score={trend.commercePotentialScore} label="Comercial" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1">
            {sources.map(s => (
              <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{sourceLabels[s]}</Badge>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-3 h-3 mr-1" /> Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
