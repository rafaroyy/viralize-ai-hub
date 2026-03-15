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
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(k)}>
      <div className="flex items-center gap-1 text-xs">
        {label} <ArrowUpDown className="w-3 h-3" />
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30">
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
              <TableRow key={t.id} className="hover:bg-secondary/20 cursor-pointer" onClick={() => onViewDetail(t)}>
                <TableCell className="font-medium text-sm text-foreground max-w-[180px] truncate">{t.label}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{categoryLabels[t.category]}</Badge></TableCell>
                <TableCell><TrendStatusBadge status={t.status} /></TableCell>
                <TableCell><RiskBadge score={t.riskScore} /></TableCell>
                <TableCell className="font-bold text-primary text-sm">{t.overallScore}</TableCell>
                <TableCell className="text-sm">{t.velocityScore}</TableCell>
                <TableCell className="text-sm">{t.viralPotentialScore}</TableCell>
                <TableCell className="text-sm">{t.commercePotentialScore}</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {sources.map(s => <Badge key={s} variant="secondary" className="text-[9px] px-1 py-0">{sourceLabels[s]?.charAt(0)}</Badge>)}
                  </div>
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewDetail(t)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onGenerateHooks(t)}><Lightbulb className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast({ title: "Salvo!", description: `${t.label} adicionada à watchlist.` })}><Bookmark className="w-3.5 h-3.5" /></Button>
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
