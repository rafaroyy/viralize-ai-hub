import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScopesDisplayProps {
  scopes: string[];
}

const scopeLabels: Record<string, string> = {
  "user.info.basic": "Informações básicas",
  "user.info.profile": "Perfil público",
  "user.info.stats": "Estatísticas",
  "video.list": "Listar vídeos",
  "video.publish": "Publicar vídeos",
};

export function ScopesDisplay({ scopes }: ScopesDisplayProps) {
  if (!scopes.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Permissões concedidas</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {scopes.map((scope) => (
          <Badge key={scope} variant="secondary" className="text-xs">
            {scopeLabels[scope] || scope}
          </Badge>
        ))}
      </div>
    </div>
  );
}
