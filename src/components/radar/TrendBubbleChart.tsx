import type { Trend } from "@/types/radar";
import { Tooltip, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Cell } from "recharts";

interface Props {
  trends: Trend[];
  onViewDetail: (t: Trend) => void;
}

const tooltipStyle = {
  background: "hsl(240,12%,8%)",
  border: "1px solid hsl(240,10%,18%)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 8px 32px hsl(0 0% 0% / 0.5)",
};

function getColor(score: number) {
  if (score >= 75) return "hsl(263,70%,58%)";
  if (score >= 50) return "hsl(280,80%,65%)";
  if (score >= 25) return "hsl(240,60%,50%)";
  return "hsl(295,70%,55%)";
}

export function TrendBubbleChart({ trends, onViewDetail }: Props) {
  const data = trends.map(t => ({
    x: t.velocityScore,
    y: t.viralPotentialScore,
    z: t.overallScore,
    name: t.label,
    commerce: t.commercePotentialScore,
    trend: t,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={tooltipStyle} className="p-3 space-y-1">
        <p className="font-semibold text-foreground text-sm">{d.name}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
          <span className="text-muted-foreground">Score:</span>
          <span className="text-primary font-bold">{d.z}</span>
          <span className="text-muted-foreground">Velocidade:</span>
          <span>{d.x}</span>
          <span className="text-muted-foreground">Viral:</span>
          <span>{d.y}</span>
          <span className="text-muted-foreground">Comercial:</span>
          <span>{d.commerce}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card-premium">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Mapa de Trends</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Velocidade × Potencial Viral — tamanho = score geral</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />Alto</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "hsl(280,80%,65%)" }} />Médio</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "hsl(240,60%,50%)" }} />Baixo</span>
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <XAxis
                dataKey="x"
                name="Velocidade"
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(240,5%,55%)" }}
                axisLine={false}
                tickLine={false}
                label={{ value: "Velocidade →", position: "bottom", fontSize: 10, fill: "hsl(240,5%,55%)", offset: 5 }}
              />
              <YAxis
                dataKey="y"
                name="Viral"
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(240,5%,55%)" }}
                axisLine={false}
                tickLine={false}
                label={{ value: "Viral ↑", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(240,5%,55%)" }}
              />
              <ZAxis dataKey="z" range={[80, 600]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={data} cursor="pointer" onClick={(d: any) => d?.trend && onViewDetail(d.trend)}>
                {data.map((d, i) => (
                  <Cell key={i} fill={getColor(d.z)} fillOpacity={0.7} stroke={getColor(d.z)} strokeWidth={1} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
