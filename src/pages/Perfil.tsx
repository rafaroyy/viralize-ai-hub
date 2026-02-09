import { User, Settings, CreditCard, Bell, LogOut } from "lucide-react";
import { MemberCard } from "@/components/ui/member-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Perfil = () => {
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
            name="João Silva"
            plan="Pro"
            memberId="VRL-2026-00481"
            memberSince="Fev 2026"
            videosRemaining={12}
          />
        </section>

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
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive">
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
