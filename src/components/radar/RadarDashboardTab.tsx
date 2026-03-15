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
  const isEmpty = !loading && trends.length === 0;

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

      {!isEmpty && <RadarCharts trends={trends} />}

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">🔥 Top Trends do Momento</h3>
        {loading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Carregando trends...</div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Youtube className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">Nenhuma trend carregada ainda</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique em <span className="font-semibold text-red-500">"Atualizar YouTube"</span> para buscar os vídeos trending reais do Brasil.
              </p>
            </div>
            {onFetchYouTube && (
              <Button onClick={onFetchYouTube} disabled={fetching} className="gap-2">
                {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
                {fetching ? "Buscando..." : "Buscar Trends do YouTube"}
              </Button>
            )}
          </div>
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
