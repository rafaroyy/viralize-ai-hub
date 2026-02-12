import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import CriarVideo from "./pages/CriarVideo";
import AnaliseRoteiro from "./pages/AnaliseRoteiro";
import Modelos from "./pages/Modelos";
import ChatIA from "./pages/ChatIA";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/criar"
              element={<ProtectedRoute><AppLayout><CriarVideo /></AppLayout></ProtectedRoute>}
            />
            <Route
              path="/analise"
              element={<ProtectedRoute><AppLayout><AnaliseRoteiro /></AppLayout></ProtectedRoute>}
            />
            <Route
              path="/modelos"
              element={<ProtectedRoute><AppLayout><Modelos /></AppLayout></ProtectedRoute>}
            />
            <Route
              path="/chat"
              element={<ProtectedRoute><AppLayout><ChatIA /></AppLayout></ProtectedRoute>}
            />
            <Route
              path="/perfil"
              element={<ProtectedRoute><AppLayout><Perfil /></AppLayout></ProtectedRoute>}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
