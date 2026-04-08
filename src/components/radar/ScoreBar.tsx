import { cn } from "@/lib/utils";

function getGradient(score: number) {
  if (score >= 75) return "score-gradient-high";
  if (score >= 50) return "score-gradient-mid";
  return "score-gradient-low";
}

export function ScoreBar({ score, label, className }: { score: number; label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</span>}
      <div className="flex-1 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", getGradient(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-foreground w-8 text-right tabular-nums">{score}</span>
    </div>
  );
}
