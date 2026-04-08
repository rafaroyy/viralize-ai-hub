import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendStatusBadge } from "./TrendStatusBadge";
import { RiskBadge } from "./RiskBadge";
import { Badge } from "@/components/ui/badge";
import { Eye, Lightbulb, Bookmark, ArrowUpDown } from "lucide-react";
import { categoryLabels, sourceLabels } from "@/data/radarMocks";
import type { Trend } from "@/types/radar";
import { useToast } from "@/hooks/use-toast";

interface Props {
  trends: Trend[];
  onViewDetail: (t: Trend) => void;
  onGenerateHooks: (t: Trend) => void;
}

type SortKey = "overallScore" | "velocityScore" | "viralPotentialScore" | "commercePotentialScore" | "label";

export function RadarTrendsTab({ trends, onViewDetail, onGenerateHooks }: Props) {
  const { toast } = useToast();
  const [sortKey, setSortKey] = useState<SortKey>("overallScore");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...trends].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [trends, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead className="cursor-pointer select-none hover:text-primary transition-colors" onClick={() => toggleSort(k)}>
      <div className="flex items-center gap-1 text-xs">
        {label} <ArrowUpDown className="w-3 h-3" />
      </div>
    </TableHead>
  );

  return (
    <div className="glass-card-premium overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/20 border-border/30 hover:bg-secondary/20">
            <SortHeader label="Trend" k="label" />
            <TableHead className="text-xs">Categoria</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs">Risco</TableHead>
            <SortHeader label="Score" k="overallScore" />
            <SortHeader label="Velocidade" k="velocityScore" />
            <SortHeader label="Viral" k="viralPotentialScore" />
            <SortHeader label="Comercial" k="commercePotentialScore" />
            <TableHead className="text-xs">Fontes</TableHead>
            <TableHead className="text-xs text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(t => {
            const sources = [...new Set(t.sourceSignals.map(s => s.source))];
            return (
              <TableRow key={t.id} className="hover:bg-primary/5 cursor-pointer border-border/20 transition-colors" onClick={() => onViewDetail(t)}>
                <TableCell className="font-medium text-sm text-foreground max-w-[180px] truncate">{t.label}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px] border-border/40">{categoryLabels[t.category]}</Badge></TableCell>
                <TableCell><TrendStatusBadge status={t.status} /></TableCell>
                <TableCell><RiskBadge score={t.riskScore} /></TableCell>
                <TableCell>
                  <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-primary to-[hsl(280_80%_65%)]">{t.overallScore}</span>
                </TableCell>
                <TableCell className="text-sm tabular-nums">{t.velocityScore}</TableCell>
                <TableCell className="text-sm tabular-nums">{t.viralPotentialScore}</TableCell>
                <TableCell className="text-sm tabular-nums">{t.commercePotentialScore}</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {sources.map(s => <Badge key={s} variant="secondary" className="text-[9px] px-1 py-0 bg-secondary/50">{sourceLabels[s]?.charAt(0)}</Badge>)}
                  </div>
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary transition-colors" onClick={() => onViewDetail(t)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-amber-400 transition-colors" onClick={() => onGenerateHooks(t)}><Lightbulb className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-emerald-400 transition-colors" onClick={() => toast({ title: "Salvo!", description: `${t.label} adicionada à watchlist.` })}><Bookmark className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
