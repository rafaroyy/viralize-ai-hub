import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Video, FileSearch, LayoutGrid, MessageCircle, Sparkles, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Criar Vídeo", path: "/criar", icon: Video },
  { title: "Análise de Roteiro", path: "/analise", icon: FileSearch },
  { title: "Modelos", path: "/modelos", icon: LayoutGrid },
  { title: "Chat IA", path: "/chat", icon: MessageCircle },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col min-h-screen bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center w-full")}>
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-foreground tracking-tight whitespace-nowrap">
              Viralize AI
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={onToggle}
            className="w-full p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.title : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
                isActive
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && item.title}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="glass-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Plano Pro</p>
            <p className="text-xs text-primary font-semibold mt-1">12 vídeos restantes</p>
          </div>
        </div>
      )}
    </aside>
  );
}
