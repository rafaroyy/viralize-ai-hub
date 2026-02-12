import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import LandingPage from "./pages/LandingPage";
import CriarVideo from "./pages/CriarVideo";
import AnaliseRoteiro from "./pages/AnaliseRoteiro";
import Modelos from "./pages/Modelos";
import ChatIA from "./pages/ChatIA";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/criar"
            element={<AppLayout><CriarVideo /></AppLayout>}
          />
          <Route
            path="/analise"
            element={<AppLayout><AnaliseRoteiro /></AppLayout>}
          />
          <Route
            path="/modelos"
            element={<AppLayout><Modelos /></AppLayout>}
          />
          <Route
            path="/chat"
            element={<AppLayout><ChatIA /></AppLayout>}
          />
          <Route
            path="/perfil"
            element={<AppLayout><Perfil /></AppLayout>}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
