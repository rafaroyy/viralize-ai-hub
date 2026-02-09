import { useState, useEffect, useCallback } from "react";

export function useTheme() {
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

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggleTheme };
}
