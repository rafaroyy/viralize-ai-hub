import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/animated-sidebar";
import { Video, FileSearch, LayoutGrid, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import logoViralize from "@/assets/logo-viralize.png";

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
    label: "Modelos",
    href: "/modelos",
    icon: <LayoutGrid className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
  {
    label: "Chat IA",
    href: "/chat",
    icon: <MessageCircle className="w-5 h-5 shrink-0 text-sidebar-foreground" />,
  },
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-1">
          {open ? <Logo /> : <LogoIcon />}
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

        {/* Footer */}
        <SidebarLink
          link={{
            label: "Plano Pro • 12 vídeos",
            href: "#",
            icon: (
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary-foreground">P</span>
              </div>
            ),
          }}
          className="px-1 py-1.5 text-muted-foreground"
        />
      </SidebarBody>
    </Sidebar>
  );
}

const Logo = () => {
  return (
    <a
      href="/"
      className="flex items-center relative z-20 px-1 py-1"
    >
      <img src={logoViralize} alt="Viralize AI" className="h-24 object-contain" />
    </a>
  );
};

const LogoIcon = () => {
  return (
    <a
      href="/"
      className="flex items-center justify-center relative z-20 px-1 py-1"
    >
      <img src={logoViralize} alt="Viralize AI" className="h-10 w-10 object-cover object-left" />
    </a>
  );
};
