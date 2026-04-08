import { useState } from "react";
import { OpportunityBlock } from "./OpportunityBlock";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
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
        toast({
          title: "Erro ao gerar oportunidades",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Oportunidades geradas! ✨",
        description: `${data?.generated || 0} oportunidades criadas a partir de ${data?.trendsAnalyzed || 0} trends.`,
      });

      onRefresh();
    } catch (e: any) {
      console.error("Error generating opportunities:", e);
      toast({
        title: "Erro ao gerar oportunidades",
        description: e.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Oportunidades geradas via IA a partir das trends em alta. Cada oportunidade inclui hooks, ideias de vídeo, narrativa e CTA prontos para uso.
        </p>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          size="sm"
          className="shrink-0 gap-2"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generating ? "Gerando..." : "Gerar Oportunidades"}
        </Button>
      </div>

      {opportunities.length === 0 && !generating && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma oportunidade encontrada.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Clique em "Gerar Oportunidades" para criar automaticamente a partir das trends ativas.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map(o => <OpportunityBlock key={o.id} opp={o} />)}
      </div>
    </div>
  );
}
