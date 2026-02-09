import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Video, FileSearch, LayoutGrid, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Criar Vídeo", path: "/criar", icon: Video },
  { title: "Análise de Roteiro", path: "/analise", icon: FileSearch },
  { title: "Modelos", path: "/modelos", icon: LayoutGrid },
  { title: "Chat IA", path: "/chat", icon: MessageCircle },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold text-foreground tracking-tight">
          Viralize AI
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Plano Pro</p>
          <p className="text-xs text-primary font-semibold mt-1">12 vídeos restantes</p>
        </div>
      </div>
    </aside>
  );
}
