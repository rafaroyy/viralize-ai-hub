import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertTriangle, Loader2, RefreshCw, FlaskConical } from "lucide-react";

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error" | "expired" | "mock";

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
}

const statusConfig: Record<ConnectionStatus, { label: string; icon: React.ReactNode; className: string }> = {
  connected: {
    label: "Conectado",
    icon: <Wifi className="w-3 h-3" />,
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  disconnected: {
    label: "Desconectado",
    icon: <WifiOff className="w-3 h-3" />,
    className: "bg-muted text-muted-foreground border-border",
  },
  connecting: {
    label: "Conectando...",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  error: {
    label: "Erro",
    icon: <AlertTriangle className="w-3 h-3" />,
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  expired: {
    label: "Token Expirado",
    icon: <RefreshCw className="w-3 h-3" />,
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  mock: {
    label: "Modo Demo",
    icon: <FlaskConical className="w-3 h-3" />,
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
};

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
