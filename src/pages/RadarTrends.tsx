import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadarFilters } from "@/components/radar/RadarFilters";
import { RadarDashboardTab } from "@/components/radar/RadarDashboardTab";
import { RadarTrendsTab } from "@/components/radar/RadarTrendsTab";
import { RadarOportunidadesTab } from "@/components/radar/RadarOportunidadesTab";
import { RadarClipadorTab } from "@/components/radar/RadarClipadorTab";
import { RadarConfiguracoesTab } from "@/components/radar/RadarConfiguracoesTab";
import { RadarTikTokTab } from "@/components/radar/RadarTikTokTab";
import { TrendDetailSheet } from "@/components/radar/TrendDetailSheet";
import { GenerateHooksModal } from "@/components/radar/GenerateHooksModal";
import { useRadarTrends } from "@/hooks/useRadarTrends";
import type { Trend, RadarFiltersState } from "@/types/radar";
import { Radar, LayoutDashboard, TrendingUp, Sparkles, Scissors, Settings, Music } from "lucide-react";

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

  const { trends: allTrends, opportunities, loading, fetching, fetchYouTube, refreshTrends } = useRadarTrends();

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

  const tabItems = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "trends", label: "Trends", icon: TrendingUp },
    { value: "tiktok", label: "TikTok Virais", icon: Music },
    { value: "oportunidades", label: "Oportunidades", icon: Sparkles },
    { value: "clipador", label: "Clipador", icon: Scissors },
    { value: "configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Premium Header */}
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl gradient-primary blur-xl opacity-40 animate-pulse" />
          <div className="relative w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow radar-glow">
            <Radar className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Radar de Trends</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Descubra trends quentes e transforme em oportunidades de conteúdo</p>
        </div>
        <div className="ml-auto hidden md:block">
          <RadarFilters filters={filters} onChange={setFilters} />
        </div>
      </div>

      {/* Mobile filters */}
      <div className="md:hidden">
        <RadarFilters filters={filters} onChange={setFilters} />
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-secondary/30 backdrop-blur-lg border border-border/30 p-1 rounded-xl gap-0.5 w-full md:w-fit overflow-x-auto">
          {tabItems.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_12px_hsl(263_70%_58%/0.15)] transition-all duration-300"
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="animate-fade-in">
          <RadarDashboardTab
            trends={filtered}
            onViewDetail={openDetail}
            loading={loading}
            fetching={fetching}
            onFetchYouTube={fetchYouTube}
          />
        </TabsContent>
        <TabsContent value="trends" className="animate-fade-in">
          <RadarTrendsTab trends={filtered} onViewDetail={openDetail} onGenerateHooks={openHooks} />
        </TabsContent>
        <TabsContent value="tiktok" className="animate-fade-in">
          <RadarTikTokTab />
        </TabsContent>
        <TabsContent value="oportunidades" className="animate-fade-in">
          <RadarOportunidadesTab opportunities={opportunities} onRefresh={refreshTrends} />
        </TabsContent>
        <TabsContent value="clipador" className="animate-fade-in">
          <RadarClipadorTab trends={filtered} onViewDetail={openDetail} />
        </TabsContent>
        <TabsContent value="configuracoes" className="animate-fade-in">
          <RadarConfiguracoesTab />
        </TabsContent>
      </Tabs>

      <TrendDetailSheet trend={selectedTrend} open={detailOpen} onClose={() => setDetailOpen(false)} />
      <GenerateHooksModal trend={hooksTrend} open={hooksOpen} onClose={() => setHooksOpen(false)} />
    </div>
  );
}
