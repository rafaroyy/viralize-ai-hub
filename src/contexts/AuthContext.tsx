import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const API_BASE = "https://api.viralizeia.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("viralize_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("viralize_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        return {
          success: false,
          error: data?.message || (res.status === 401 ? "Email ou senha incorretos." : "Erro ao fazer login. Tente novamente."),
        };
      }

      const data = await res.json();
      const userData = { email };
      if (data.token) {
        localStorage.setItem("viralize_token", data.token);
      }
      localStorage.setItem("viralize_user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch {
      return { success: false, error: "Erro de conexão. Verifique sua internet." };
    }
  };

  const logout = () => {
    localStorage.removeItem("viralize_user");
    localStorage.removeItem("viralize_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
