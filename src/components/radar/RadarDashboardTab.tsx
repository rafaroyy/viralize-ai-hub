import { RadarKpiCards } from "./RadarKpiCards";
import { RadarCharts } from "./RadarCharts";
import { TrendCard } from "./TrendCard";
import type { Trend } from "@/types/radar";

interface Props {
  trends: Trend[];
  onViewDetail: (t: Trend) => void;
}

export function RadarDashboardTab({ trends, onViewDetail }: Props) {
  const top10 = [...trends].sort((a, b) => b.overallScore - a.overallScore).slice(0, 10);

  return (
    <div className="space-y-6">
      <RadarKpiCards trends={trends} />
      <RadarCharts trends={trends} />

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">🔥 Top Trends do Momento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {top10.map((t, i) => (
            <TrendCard key={t.id} trend={t} rank={i + 1} onViewDetail={onViewDetail} />
          ))}
        </div>
      </div>
    </div>
  );
}
