import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import CriarVideo from "./pages/CriarVideo";
import AnaliseRoteiro from "./pages/AnaliseRoteiro";
import Modelos from "./pages/Modelos";
import ChatIA from "./pages/ChatIA";
import MeusVideos from "./pages/MeusVideos";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout><Outlet /></AppLayout>;
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
            <Route element={<ProtectedRoute />}>
              <Route path="/criar" element={<CriarVideo />} />
              <Route path="/analise" element={<AnaliseRoteiro />} />
              <Route path="/modelos" element={<Modelos />} />
              <Route path="/chat" element={<ChatIA />} />
              <Route path="/meus-videos" element={<MeusVideos />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
