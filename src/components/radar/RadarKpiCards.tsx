import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Zap, Eye, ShoppingCart, Clock } from "lucide-react";
import type { Trend } from "@/types/radar";

interface Props { trends: Trend[]; }

export function RadarKpiCards({ trends }: Props) {
  const total = trends.length;
  const novas24h = trends.filter(t => {
    const h = (Date.now() - new Date(t.firstSeenAt).getTime()) / 3600000;
    return h <= 24;
  }).length;
  const acelerando = trends.filter(t => t.status === "subindo").length;
  const caindo = trends.filter(t => t.status === "caindo" || t.status === "morta").length;
  const oportunidades = trends.filter(t => t.commercePotentialScore >= 70).length;

  const kpis = [
    { label: "Trends Monitoradas", value: total, icon: Eye, color: "text-primary" },
    { label: "Novas (24h)", value: novas24h, icon: Zap, color: "text-blue-400" },
    { label: "Acelerando", value: acelerando, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Em Queda", value: caindo, icon: TrendingDown, color: "text-orange-400" },
    { label: "Oportunidades", value: oportunidades, icon: ShoppingCart, color: "text-amber-400" },
    { label: "Atualização", value: "Agora", icon: Clock, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map(k => (
        <Card key={k.label} className="glass-card">
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <k.icon className={`w-4 h-4 ${k.color}`} />
              <span className="text-[11px] text-muted-foreground">{k.label}</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{k.value}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
