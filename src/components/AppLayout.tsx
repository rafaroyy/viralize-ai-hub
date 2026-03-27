import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { WeeklyDigestModal } from "./WeeklyDigestModal";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-auto transition-all duration-300 ease-in-out">
        {children}
      </main>
      <WeeklyDigestModal />
    </div>
  );
}
