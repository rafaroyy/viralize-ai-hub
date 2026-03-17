import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadarFilters } from "@/components/radar/RadarFilters";
import { RadarDashboardTab } from "@/components/radar/RadarDashboardTab";
import { RadarTrendsTab } from "@/components/radar/RadarTrendsTab";
import { RadarOportunidadesTab } from "@/components/radar/RadarOportunidadesTab";
import { RadarClipadorTab } from "@/components/radar/RadarClipadorTab";
import { RadarConfiguracoesTab } from "@/components/radar/RadarConfiguracoesTab";
import { TrendDetailSheet } from "@/components/radar/TrendDetailSheet";
import { GenerateHooksModal } from "@/components/radar/GenerateHooksModal";
import { useRadarTrends } from "@/hooks/useRadarTrends";
import type { Trend, RadarFiltersState } from "@/types/radar";
import { Radar } from "lucide-react";

const defaultFilters: RadarFiltersState = {
  timeWindow: "24h",
  sources: [],
  categories: [],
  statuses: [],
  risks: [],
  niches: [],
  search: "",
};

export default function RadarTrendsPage() {
  const [filters, setFilters] = useState<RadarFiltersState>(defaultFilters);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [hooksTrend, setHooksTrend] = useState<Trend | null>(null);
  const [hooksOpen, setHooksOpen] = useState(false);

  const { trends: allTrends, opportunities, loading, fetching, fetchYouTube } = useRadarTrends();

  const filtered = useMemo(() => {
    return allTrends.filter(t => {
      if (filters.search && !t.label.toLowerCase().includes(filters.search.toLowerCase()) && !t.aliases.some(a => a.toLowerCase().includes(filters.search.toLowerCase()))) return false;
      if (filters.sources.length && !t.sourceSignals.some(s => filters.sources.includes(s.source))) return false;
      if (filters.categories.length && !filters.categories.includes(t.category)) return false;
      if (filters.statuses.length && !filters.statuses.includes(t.status)) return false;
      if (filters.niches.length && !t.niches.some(n => filters.niches.includes(n))) return false;
      if (filters.risks.length) {
        const level = t.riskScore >= 60 ? "alto" : t.riskScore >= 30 ? "medio" : "baixo";
        if (!filters.risks.includes(level)) return false;
      }
      return true;
    });
  }, [filters, allTrends]);

  const openDetail = (t: Trend) => { setSelectedTrend(t); setDetailOpen(true); };
  const openHooks = (t: Trend) => { setHooksTrend(t); setHooksOpen(true); };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Radar className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Radar de Trends</h1>
          <p className="text-xs text-muted-foreground">Descubra trends quentes e transforme em oportunidades de conteúdo</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <TabsList className="bg-secondary/50 w-fit">
            <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
            <TabsTrigger value="oportunidades" className="text-xs">Oportunidades</TabsTrigger>
            <TabsTrigger value="clipador" className="text-xs">Clipador</TabsTrigger>
            <TabsTrigger value="configuracoes" className="text-xs">Configurações</TabsTrigger>
          </TabsList>
          <RadarFilters filters={filters} onChange={setFilters} />
        </div>

        <TabsContent value="dashboard">
          <RadarDashboardTab
            trends={filtered}
            onViewDetail={openDetail}
            loading={loading}
            fetching={fetching}
            onFetchYouTube={fetchYouTube}
          />
        </TabsContent>
        <TabsContent value="trends">
          <RadarTrendsTab trends={filtered} onViewDetail={openDetail} onGenerateHooks={openHooks} />
        </TabsContent>
        <TabsContent value="oportunidades">
          <RadarOportunidadesTab opportunities={opportunities} />
        </TabsContent>
        <TabsContent value="clipador">
          <RadarClipadorTab trends={filtered} onViewDetail={openDetail} />
        </TabsContent>
        <TabsContent value="configuracoes">
          <RadarConfiguracoesTab />
        </TabsContent>
      </Tabs>

      <TrendDetailSheet trend={selectedTrend} open={detailOpen} onClose={() => setDetailOpen(false)} />
      <GenerateHooksModal trend={hooksTrend} open={hooksOpen} onClose={() => setHooksOpen(false)} />
    </div>
  );
}
