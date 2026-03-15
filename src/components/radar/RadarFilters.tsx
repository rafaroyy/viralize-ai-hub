import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { RadarFiltersState, TimeWindow, SourceType, TrendStatus } from "@/types/radar";
import { sourceLabels, statusLabels, availableSources, comingSoonSources } from "@/data/radarMocks";

interface Props {
  filters: RadarFiltersState;
  onChange: (f: RadarFiltersState) => void;
}

export function RadarFilters({ filters, onChange }: Props) {
  const update = (partial: Partial<RadarFiltersState>) => onChange({ ...filters, ...partial });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar trend..."
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
          className="pl-9 h-9 w-48 bg-secondary/50 border-border"
        />
      </div>
      <Select value={filters.timeWindow} onValueChange={(v: TimeWindow) => update({ timeWindow: v })}>
        <SelectTrigger className="h-9 w-24 bg-secondary/50"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="24h">24h</SelectItem>
          <SelectItem value="72h">72h</SelectItem>
          <SelectItem value="7d">7 dias</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.sources[0] || "all"} onValueChange={(v) => update({ sources: v === "all" ? [] : [v as SourceType] })}>
        <SelectTrigger className="h-9 w-36 bg-secondary/50"><SelectValue placeholder="Fonte" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas fontes</SelectItem>
          {availableSources.map(k => <SelectItem key={k} value={k}>{sourceLabels[k]}</SelectItem>)}
          {comingSoonSources.map(k => (
            <SelectItem key={k} value={k} disabled className="opacity-50">
              {sourceLabels[k]} (Em breve)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.statuses[0] || "all"} onValueChange={(v) => update({ statuses: v === "all" ? [] : [v as TrendStatus] })}>
        <SelectTrigger className="h-9 w-28 bg-secondary/50"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" className="h-9 gap-1 text-muted-foreground" onClick={() => onChange({ timeWindow: "24h", sources: [], categories: [], statuses: [], risks: [], niches: [], search: "" })}>
        <Filter className="w-3.5 h-3.5" /> Limpar
      </Button>
    </div>
  );
}
