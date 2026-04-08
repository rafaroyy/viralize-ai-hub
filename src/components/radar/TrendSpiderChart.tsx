import type { Trend } from "@/types/radar";
import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

interface Props {
  trend: Trend;
}

export function TrendSpiderChart({ trend }: Props) {
  const data = [
    { axis: "Velocidade", value: trend.velocityScore },
    { axis: "Viral", value: trend.viralPotentialScore },
    { axis: "Comercial", value: trend.commercePotentialScore },
    { axis: "Novidade", value: trend.noveltyScore ?? 50 },
    { axis: "Cross-Source", value: trend.crossSourceScore ?? 50 },
  ];

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="hsl(240,10%,18%)" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "hsl(240,5%,55%)" }} />
          <Radar
            dataKey="value"
            stroke="hsl(263,70%,58%)"
            fill="hsl(263,70%,58%)"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 3, fill: "hsl(263,70%,58%)", stroke: "hsl(263,70%,58%)" }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
