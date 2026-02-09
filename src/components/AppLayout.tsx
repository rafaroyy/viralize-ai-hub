import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
