import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, QuotaResponse } from "@/lib/api";

interface UserData {
  user_id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  quota: QuotaResponse["quota"] | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshQuota: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [quota, setQuota] = useState<QuotaResponse["quota"] | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshQuota = async () => {
    try {
      const data = await api.quota();
      setQuota(data.quota);
    } catch (err: any) {
      if (err?.status === 401 || err?.message?.toLowerCase().includes("token") || err?.message?.toLowerCase().includes("expirado")) {
        localStorage.removeItem("viralize_user");
        localStorage.removeItem("viralize_token");
        setUser(null);
        setQuota(null);
      }
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("viralize_user");
    const token = localStorage.getItem("viralize_token");
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Validate token by refreshing quota
        refreshQuota().finally(() => setLoading(false));
        return;
      } catch {
        localStorage.removeItem("viralize_user");
        localStorage.removeItem("viralize_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      const userData: UserData = {
        user_id: data.user_id,
        username: data.username,
        email,
      };
      localStorage.setItem("viralize_token", data.access_token);
      localStorage.setItem("viralize_user", JSON.stringify(userData));
      setUser(userData);
      // Fetch quota after login
      await refreshQuota();
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "Erro ao fazer login. Tente novamente.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("viralize_user");
    localStorage.removeItem("viralize_token");
    setUser(null);
    setQuota(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, quota, login, logout, refreshQuota, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
