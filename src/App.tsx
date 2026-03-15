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
import PaginaVendas from "./pages/PaginaVendas";
import AnalisadorViral from "./pages/AnalisadorViral";
import ModelarPost from "./pages/ModelarPost";
import Historico from "./pages/Historico";
import AffiliateHub from "./pages/AffiliateHub";

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
            <Route path="/pagina" element={<PaginaVendas />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/criar" element={<CriarVideo />} />
              <Route path="/analise" element={<AnaliseRoteiro />} />
              <Route path="/modelos" element={<Modelos />} />
              <Route path="/chat" element={<ChatIA />} />
              <Route path="/meus-videos" element={<MeusVideos />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/analisador-viral" element={<AnalisadorViral />} />
              <Route path="/modelar-post" element={<ModelarPost />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/affiliate-hub" element={<AffiliateHub />} />
            </Route>
            <Route path="/:affiliateSlug" element={<LandingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
