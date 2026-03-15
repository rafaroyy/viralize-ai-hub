import { Clock } from "lucide-react";

export interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

interface ConnectionLogsProps {
  logs: LogEntry[];
}

const typeColors: Record<LogEntry["type"], string> = {
  info: "text-muted-foreground",
  success: "text-green-400",
  error: "text-destructive",
  warning: "text-yellow-400",
};

export function ConnectionLogs({ logs }: ConnectionLogsProps) {
  if (!logs.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Logs de conexão</span>
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto rounded-lg bg-muted/30 p-3">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 tabular-nums">
              {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
            </span>
            <span className={typeColors[log.type]}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
