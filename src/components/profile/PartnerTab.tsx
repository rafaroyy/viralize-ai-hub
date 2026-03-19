import { useEffect, useState } from "react";
import { Crown, Copy, Link, ExternalLink, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AffiliateData {
  slug: string;
  name: string;
  checkout_monthly: string;
  checkout_lifetime: string;
  active: boolean;
}

const PartnerTab = () => {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliate = async () => {
      if (!user?.email) return;
      const { data } = await supabase
        .from("affiliates")
        .select("slug, name, checkout_monthly, checkout_lifetime, active")
        .eq("email", user.email)
        .eq("active", true)
        .maybeSingle();
      setAffiliate(data);
      setLoading(false);
    };
    fetchAffiliate();
  }, [user?.email]);

  const inviteLink = affiliate ? `https://viralizeia.com/${affiliate.slug}` : "";

  const copyLink = (link: string, label: string) => {
    navigator.clipboard.writeText(link);
    toast.success(`${label} copiado!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <Crown className="w-12 h-12 text-muted-foreground mx-auto" />
        <h3 className="font-display text-lg font-semibold">Conta de parceiro não configurada</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Seu email está autorizado como parceiro, mas ainda não há um registro de afiliado vinculado.
          Entre em contato com o suporte para ativar seu link.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold">{affiliate.name}</h2>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Parceiro Oficial
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Compartilhe seu link e convide novos membros com preço especial.
          </p>
        </div>
      </div>

      {/* Link de Convite */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Seu Link de Convite</h3>
        </div>
        <Separator className="bg-border/50" />
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <code className="flex-1 text-sm text-foreground truncate">{inviteLink}</code>
          <Button size="sm" onClick={() => copyLink(inviteLink, "Link de convite")} className="gap-2 shrink-0">
            <Copy className="w-4 h-4" />
            Copiar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          <Gift className="w-3.5 h-3.5 inline mr-1" />
          Quem acessar por esse link terá acesso a preços exclusivos de parceiro.
        </p>
      </div>

      {/* Links de Checkout */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Links de Checkout Direto</h3>
        <Separator className="bg-border/50" />
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="text-sm font-medium">Plano Mensal</p>
              <p className="text-xs text-muted-foreground truncate max-w-[250px]">{affiliate.checkout_monthly}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => copyLink(affiliate.checkout_monthly, "Link mensal")}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={affiliate.checkout_monthly} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="text-sm font-medium">Plano Vitalício</p>
              <p className="text-xs text-muted-foreground truncate max-w-[250px]">{affiliate.checkout_lifetime}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => copyLink(affiliate.checkout_lifetime, "Link vitalício")}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={affiliate.checkout_lifetime} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerTab;
