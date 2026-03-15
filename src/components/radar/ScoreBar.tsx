import { cn } from "@/lib/utils";

function getColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-destructive";
}

export function ScoreBar({ score, label, className }: { score: number; label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>}
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", getColor(score))} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-foreground w-8 text-right">{score}</span>
    </div>
  );
}
