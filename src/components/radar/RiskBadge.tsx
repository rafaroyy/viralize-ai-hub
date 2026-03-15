import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function riskLevel(score: number) {
  if (score >= 60) return { label: "Alto", className: "bg-destructive/20 text-destructive border-destructive/30" };
  if (score >= 30) return { label: "Médio", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  return { label: "Baixo", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
}

export function RiskBadge({ score }: { score: number }) {
  const c = riskLevel(score);
  return <Badge className={cn("text-[10px] font-semibold", c.className)}>{c.label}</Badge>;
}
