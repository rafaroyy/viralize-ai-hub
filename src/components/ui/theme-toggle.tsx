import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return !document.documentElement.classList.contains("light");
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [isDark]);

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-colors duration-300",
        isDark ? "bg-secondary justify-end" : "bg-primary/20 justify-start",
        className
      )}
      onClick={() => setIsDark(!isDark)}
      role="button"
      tabIndex={0}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center gradient-primary shadow-glow transition-transform duration-300">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-primary-foreground" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-primary-foreground" />
        )}
      </div>
    </div>
  );
}
