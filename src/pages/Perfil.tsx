import { User, Settings, CreditCard, Bell, LogOut } from "lucide-react";
import { MemberCard } from "@/components/ui/member-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Perfil = () => {
  const { user, quota, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.username ?? user?.email?.split("@")[0] ?? "Usuário";
  const videosRemaining = quota?.total?.remaining ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen overflow-auto p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold">Meu Perfil</h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie sua conta e visualize seu cartão de membro exclusivo.
          </p>
        </div>

        {/* Member Card Section */}
        <section className="glass-card p-8 flex flex-col items-center space-y-4 mb-8">
          <h2 className="font-display text-lg font-semibold text-center">
            Cartão de Membro
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Seu cartão exclusivo de membro da Viralize AI
          </p>
          <MemberCard
            name={displayName}
            plan="Pro"
            memberId={`VRL-${user?.user_id ?? "0000"}`}
            memberSince="2026"
            videosRemaining={videosRemaining}
          />
        </section>

        {/* Quota Info */}
        {quota && (
          <section className="glass-card p-6 space-y-4 mb-8">
            <h2 className="font-display text-lg font-semibold">Uso do Plano</h2>
            <Separator className="bg-border/50" />
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold font-display text-primary">{quota.total.remaining}</p>
                <p className="text-xs text-muted-foreground">Total restante</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-display">{quota.sora.remaining}</p>
                <p className="text-xs text-muted-foreground">Sora restante</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-display">{quota.custom.remaining}</p>
                <p className="text-xs text-muted-foreground">Custom restante</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Ciclo: {new Date(quota.period_start).toLocaleDateString("pt-BR")} — {new Date(quota.period_end).toLocaleDateString("pt-BR")}
            </p>
          </section>
        )}

        {/* Quick Actions */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Configurações</h2>
          <Separator className="bg-border/50" />

          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-foreground">
              <Settings className="w-4 h-4 text-muted-foreground" />
              Configurações da conta
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-foreground">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Gerenciar assinatura
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-foreground">
              <Bell className="w-4 h-4 text-muted-foreground" />
              Notificações
            </Button>
            <Separator className="bg-border/50" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Perfil;
