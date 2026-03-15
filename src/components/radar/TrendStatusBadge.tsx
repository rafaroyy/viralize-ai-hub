import { Badge } from "@/components/ui/badge";
import type { TrendStatus } from "@/types/radar";
import { cn } from "@/lib/utils";

const config: Record<TrendStatus, { label: string; className: string }> = {
  nova: { label: "Nova", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  subindo: { label: "Subindo", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  pico: { label: "Pico", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  caindo: { label: "Caindo", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  morta: { label: "Morta", className: "bg-muted text-muted-foreground border-border" },
};

export function TrendStatusBadge({ status }: { status: TrendStatus }) {
  const c = config[status];
  return <Badge className={cn("text-[10px] font-semibold", c.className)}>{c.label}</Badge>;
}
