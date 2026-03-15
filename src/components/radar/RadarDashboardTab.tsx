import { RadarKpiCards } from "./RadarKpiCards";
import { RadarCharts } from "./RadarCharts";
import { TrendCard } from "./TrendCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Youtube } from "lucide-react";
import type { Trend } from "@/types/radar";

interface Props {
  trends: Trend[];
  onViewDetail: (t: Trend) => void;
  loading?: boolean;
  fetching?: boolean;
  onFetchYouTube?: () => void;
}

export function RadarDashboardTab({ trends, onViewDetail, loading, fetching, onFetchYouTube }: Props) {
  const top10 = [...trends].sort((a, b) => b.overallScore - a.overallScore).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <RadarKpiCards trends={trends} />
        {onFetchYouTube && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFetchYouTube}
            disabled={fetching}
            className="shrink-0 gap-2"
          >
            {fetching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Youtube className="w-4 h-4 text-red-500" />
            )}
            {fetching ? "Buscando..." : "Atualizar YouTube"}
          </Button>
        )}
      </div>
      <RadarCharts trends={trends} />

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">🔥 Top Trends do Momento</h3>
        {loading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Carregando trends...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {top10.map((t, i) => (
              <TrendCard key={t.id} trend={t} rank={i + 1} onViewDetail={onViewDetail} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
