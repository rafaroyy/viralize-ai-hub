import { useEffect, useState } from "react";
import { Crown, Copy, Gift, Lock, Unlock, Mail, TrendingUp, Users, ExternalLink } from "lucide-react";
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

const MOCK_INVITES = [
  { name: "Maria Santos", email: "maria@email.com", status: "Ativo", date: "15/03/2026" },
  { name: "Pedro Costa", email: "pedro@email.com", status: "Ativo", date: "10/03/2026" },
  { name: "Ana Lima", email: "ana@email.com", status: "Pendente", date: "18/03/2026" },
];

const PartnerTab = () => {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedSlots, setUnlockedSlots] = useState<Set<number>>(new Set());

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

  const displayName = user?.username ?? user?.email?.split("@")[0] ?? "Parceiro";

  const copyLink = (link: string, label: string) => {
    navigator.clipboard.writeText(link);
    toast.success(`${label} copiado!`);
  };

  const toggleUnlock = (index: number) => {
    setUnlockedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const maskLink = (url: string) => {
    if (!url) return "https://••••••••••••••••••";
    const visible = url.substring(0, 30);
    return `${visible}•••••••`;
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

  const totalSlots = 5;
  const inviteSlots = Array.from({ length: totalSlots }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-xl">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold">{affiliate.name}</h2>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Parceiro Oficial
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Membro desde 2026</p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Seus convites estão abaixo!")}>
          <Gift className="w-4 h-4" />
          Resgatar Convites
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Convites Disponíveis</p>
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold font-display">5</p>
          <p className="text-xs text-muted-foreground">Prontos para compartilhar</p>
        </div>
        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Enviados</p>
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold font-display">12</p>
          <p className="text-xs text-muted-foreground">Convites compartilhados</p>
        </div>
        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Convites Ativos</p>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold font-display">8</p>
          <p className="text-xs text-muted-foreground">Pessoas convidadas ativas</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite Links */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Seus Links de Convite</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Compartilhe estes links exclusivos com pessoas que você deseja convidar para a Viralize AI
          </p>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {inviteSlots.map((index) => {
              const isUnlocked = unlockedSlots.has(index);
              return (
                <div key={index} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {isUnlocked ? (
                        <Unlock className="w-4 h-4 text-primary" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                      {isUnlocked ? "Link de Convite Desbloqueado" : "Link de Convite Bloqueado"}
                    </div>
                    <Button
                      size="sm"
                      variant={isUnlocked ? "ghost" : "outline"}
                      className="gap-1.5 text-xs"
                      onClick={() => toggleUnlock(index)}
                    >
                      {isUnlocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          Bloquear
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          Desbloquear
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-md bg-background/50 p-2.5 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-0.5">Link Mensal</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-foreground/80 flex-1 truncate">
                          {isUnlocked ? affiliate.checkout_monthly : maskLink(affiliate.checkout_monthly)}
                        </code>
                        {isUnlocked && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => copyLink(affiliate.checkout_monthly, "Link mensal")}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="rounded-md bg-background/50 p-2.5 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-0.5">Link Vitalício</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-foreground/80 flex-1 truncate">
                          {isUnlocked ? affiliate.checkout_lifetime : maskLink(affiliate.checkout_lifetime)}
                        </code>
                        {isUnlocked && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => copyLink(affiliate.checkout_lifetime, "Link vitalício")}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Invites */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Convites Recentes</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Pessoas que você convidou para a plataforma
          </p>
          <div className="space-y-3">
            {MOCK_INVITES.map((invite, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {invite.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{invite.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{invite.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge
                    variant={invite.status === "Ativo" ? "default" : "secondary"}
                    className={invite.status === "Ativo" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}
                  >
                    {invite.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{invite.date}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full">
            Ver Todos os Convites
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Como Funcionam os Convites?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: 1, title: "Desbloqueie o Link", desc: "Clique em desbloquear para revelar os links de convite mensal e vitalício" },
            { step: 2, title: "Compartilhe", desc: "Copie e envie o link para a pessoa que você deseja convidar" },
            { step: 3, title: "Acompanhe", desc: "Veja quando seu convidado aceitar e se tornar um membro ativo" },
          ].map((item) => (
            <div key={item.step} className="text-center space-y-2 p-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto text-lg">
                {item.step}
              </div>
              <h4 className="font-semibold text-sm">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerTab;
