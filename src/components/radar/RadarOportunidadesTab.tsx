import { useState } from "react";
import { OpportunityBlock } from "./OpportunityBlock";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Opportunity } from "@/types/radar";

interface Props {
  opportunities: Opportunity[];
  onRefresh: () => void;
}

export function RadarOportunidadesTab({ opportunities, onRefresh }: Props) {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("radar-generate-opportunities");
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Erro ao gerar", description: data.error, variant: "destructive" });
        return;
      }
      toast({ title: "Oportunidades geradas! ✨", description: `${data?.generated || 0} oportunidades criadas.` });
      onRefresh();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground max-w-xl">
          Oportunidades geradas via IA com hooks, ideias de vídeo, narrativa e CTA prontos para uso.
        </p>
        <Button onClick={handleGenerate} disabled={generating} size="sm" className="shrink-0 gap-2 gradient-primary border-0 shadow-glow hover:shadow-[0_0_24px_hsl(263_70%_58%/0.3)] transition-shadow">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Gerando..." : "Gerar Oportunidades"}
        </Button>
      </div>

      {opportunities.length === 0 && !generating && (
        <div className="glass-card-premium">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Lightbulb className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-sm font-medium text-foreground">Nenhuma oportunidade encontrada</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Clique em "Gerar Oportunidades" para criar automaticamente a partir das trends ativas.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map(o => <OpportunityBlock key={o.id} opp={o} />)}
      </div>
    </div>
  );
}
