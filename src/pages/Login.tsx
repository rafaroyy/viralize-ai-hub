import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useTheme } from "@/hooks/use-theme";
import logoViralize from "@/assets/logo-viralize.png";
import logoViralizeLight from "@/assets/logo-viralize-light.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      navigate("/criar");
    } else {
      setError(result.error || "Erro ao fazer login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background paths */}
      <BackgroundPaths />

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 rounded-2xl border border-border/50">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/">
              <img
                src={isDark ? logoViralize : logoViralizeLight}
                alt="Viralize AI"
                className="h-28 object-contain"
              />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground text-center text-sm mb-8">
            Entre na sua conta para continuar
          </p>

          {/* Error alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-border/50 bg-secondary/30 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-border/50 bg-secondary/30 px-4 py-2 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-primary text-primary-foreground h-11 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ainda não tem conta?{" "}
            <Link to="/" className="text-primary hover:underline">
              Saiba mais
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
