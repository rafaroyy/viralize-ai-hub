import { OpportunityBlock } from "./OpportunityBlock";
import type { Opportunity } from "@/types/radar";

interface Props { opportunities: Opportunity[]; }

export function RadarOportunidadesTab({ opportunities }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Oportunidades geradas automaticamente a partir das trends em alta. Cada oportunidade inclui hooks, ideias de vídeo, narrativa e CTA prontos para uso.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map(o => <OpportunityBlock key={o.id} opp={o} />)}
      </div>
    </div>
  );
}
