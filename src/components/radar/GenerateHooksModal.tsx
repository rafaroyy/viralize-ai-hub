import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Lightbulb, Video, Sparkles } from "lucide-react";
import type { Trend } from "@/types/radar";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  trend: Trend | null;
  open: boolean;
  onClose: () => void;
}

export function GenerateHooksModal({ trend, open, onClose }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!trend) return null;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Hook copiado para a área de transferência." });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Hooks & Ideias — {trend.label}
          </DialogTitle>
          <DialogDescription>Sugestões prontas baseadas na análise da trend</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">Hooks</span>
            </div>
            <div className="space-y-2">
              {trend.suggestedHooks.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group">
                  <p className="text-sm text-foreground flex-1">"{h}"</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => copy(h)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Video className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-foreground">Ideias de Vídeo</span>
            </div>
            <div className="space-y-2">
              {trend.recommendedAngles.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group">
                  <p className="text-sm text-muted-foreground flex-1">{a}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => copy(a)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-xs text-muted-foreground">Formatos:</span>
            {trend.suggestedFormats.map(f => <Badge key={f} variant="outline" className="text-[10px] capitalize">{f}</Badge>)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
