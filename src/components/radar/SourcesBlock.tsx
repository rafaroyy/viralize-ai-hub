import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { SourceSignal } from "@/types/radar";
import { sourceLabels } from "@/data/radarMocks";

export function SourcesBlock({ signals }: { signals: SourceSignal[] }) {
  return (
    <div className="space-y-2">
      {signals.map(s => (
        <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">{sourceLabels[s.source]}</Badge>
            <span className="text-xs text-foreground">{s.signalLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary">{s.normalizedScore}</span>
            {s.url && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
          </div>
        </div>
      ))}
    </div>
  );
}
