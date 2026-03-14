import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/animated-sidebar";
import { Video, FileSearch, LayoutGrid, MessageCircle, Film, Flame, Image as ImageIcon, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import logoViralize from "@/assets/logo-viralize.png";
import logoViralizeLight from "@/assets/logo-viralize-light.png";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  {
    label: "Criar Vídeo",
    href: "/criar",
    icon: <Video className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
  {
    label: "Análise de Roteiro",
    href: "/analise",
    icon: <FileSearch className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
  {
    label: "Analisador Viral",
    href: "/analisador-viral",
    icon: <Flame className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
  {
    label: "Modelar Post",
    href: "/modelar-post",
    icon: <ImageIcon className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
  {
    label: "Modelos",
    href: "/modelos",
    icon: <LayoutGrid className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
  {
    label: "Chat IA",
    href: "/chat",
    icon: <MessageCircle className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
  {
    label: "Meus Vídeos",
    href: "/meus-videos",
    icon: <Film className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
  {
    label: "Histórico",
    href: "/historico",
    icon: <Clock className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, quota } = useAuth();
  const displayName = user?.username ?? "Usuário";
  const videosRemaining = quota?.total?.remaining;
  const currentLogo = isDark ? logoViralize : logoViralizeLight;
  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-1">
          {open ? <Logo src={currentLogo} /> : <LogoIcon src={currentLogo} />}
          <nav className="mt-5 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <SidebarLink
                  key={link.href}
                  link={{
                    ...link,
                    icon: (
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isActive ? "gradient-primary shadow-glow" : "bg-secondary/50"
                      )}>
                        {React.cloneElement(link.icon as React.ReactElement, {
                          className: cn(
                            "w-4 h-4 shrink-0",
                            isActive ? "text-primary-foreground" : "text-sidebar-foreground"
                          ),
                        })}
                      </div>
                    ),
                  }}
                  className={cn(
                    "px-1 py-1.5 rounded-lg transition-colors",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                  )}
                />
              );
            })}
          </nav>
        </div>

        {/* Theme Toggle & Footer */}
        <div className="flex flex-col gap-3">
          <div className="px-1 flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-xs text-muted-foreground whitespace-pre"
            >
              Tema
            </motion.span>
          </div>
          <SidebarLink
            link={{
              label: `${displayName} · ${videosRemaining ?? "?"} vídeos`,
              href: "/perfil",
              icon: (
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary-foreground">P</span>
                </div>
              ),
            }}
            className={cn(
              "px-1 py-1.5",
              location.pathname === "/perfil"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

const Logo = ({ src }: { src: string }) => {
  return (
    <Link
      to="/criar"
      className="flex items-center relative z-20 -mx-3 -mt-8 -mb-12"
    >
      <img src={src} alt="Viralize AI" className="h-44 object-contain" />
    </Link>
  );
};

const LogoIcon = ({ src }: { src: string }) => {
  return (
    <Link
      to="/criar"
      className="flex items-center justify-center relative z-20"
    >
      <img src={src} alt="Viralize AI" className="h-12 w-12 object-cover object-left" />
    </Link>
  );
};
