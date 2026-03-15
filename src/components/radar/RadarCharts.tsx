import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import type { Trend } from "@/types/radar";
import { sourceLabels, categoryLabels } from "@/data/radarMocks";

const COLORS = ["hsl(263,70%,58%)", "hsl(280,80%,65%)", "hsl(240,60%,50%)", "hsl(295,70%,55%)"];

export function RadarCharts({ trends }: { trends: Trend[] }) {
  // Volume by source
  const sourceCounts: Record<string, number> = {};
  trends.forEach(t => {
    const ss = new Set(t.sourceSignals.map(s => s.source));
    ss.forEach(s => { sourceCounts[s] = (sourceCounts[s] || 0) + 1; });
  });
  const sourceData = Object.entries(sourceCounts).map(([k, v]) => ({ name: sourceLabels[k] || k, value: v }));

  // Category distribution
  const catCounts: Record<string, number> = {};
  trends.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
  const catData = Object.entries(catCounts).map(([k, v]) => ({ name: categoryLabels[k] || k, value: v }));

  // Evolution (simulated)
  const evoData = [
    { hour: "00h", trends: 3 }, { hour: "04h", trends: 5 }, { hour: "08h", trends: 8 },
    { hour: "12h", trends: 12 }, { hour: "16h", trends: 10 }, { hour: "20h", trends: 15 }, { hour: "Agora", trends: trends.length },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Volume por Fonte</CardTitle></CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(240,5%,55%)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(240,12%,8%)", border: "1px solid hsl(240,10%,18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(263,70%,58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Distribuição por Categoria</CardTitle></CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={30} paddingAngle={2}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(240,12%,8%)", border: "1px solid hsl(240,10%,18%)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Evolução (24h)</CardTitle></CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evoData}>
              <defs>
                <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(263,70%,58%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(263,70%,58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(240,5%,55%)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(240,12%,8%)", border: "1px solid hsl(240,10%,18%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="trends" stroke="hsl(263,70%,58%)" fill="url(#radarGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
