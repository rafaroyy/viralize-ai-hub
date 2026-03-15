import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import { ScopesDisplay } from "./ScopesDisplay";
import { ConnectionLogs } from "./ConnectionLogs";
import { useTikTokIntegration } from "@/hooks/useTikTokIntegration";
import { Loader2, Link2, Unlink, RefreshCw, FlaskConical, AlertTriangle, Clock } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.88a8.28 8.28 0 0 0 3.76.91V6.69Z" />
    </svg>
  );
}

export function TikTokIntegrationCard() {
  const { status, integration, loading, error, logs, isMock, connect, disconnect, refresh } = useTikTokIntegration();

  const displayStatus = isMock && status === "disconnected" ? "mock" : status;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <TikTokIcon className="w-5 h-5 text-background" />
            </div>
            <div>
              <CardTitle className="text-lg">TikTok</CardTitle>
              <CardDescription>Conecte sua conta TikTok para acessar dados e publicar vídeos.</CardDescription>
            </div>
          </div>
          <ConnectionStatusBadge status={displayStatus === "mock" ? "mock" : status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mock mode banner */}
        {isMock && (
          <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-sm text-purple-300">
            <FlaskConical className="w-4 h-4 shrink-0" />
            <span>Modo demonstração — credenciais TikTok não configuradas. O fluxo será simulado.</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Token expired warning */}
        {status === "expired" && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm text-yellow-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>O token de acesso expirou. Reconecte ou renove para continuar usando a integração.</span>
          </div>
        )}

        {/* Connected info */}
        {status === "connected" && integration && (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Usuário TikTok</span>
                <p className="font-medium text-foreground">@{integration.provider_user_id || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Conectado em</span>
                <p className="font-medium text-foreground">
                  {integration.connected_at
                    ? new Date(integration.connected_at).toLocaleDateString("pt-BR")
                    : "—"}
                </p>
              </div>
            </div>

            {integration.last_synced_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Último sync: {new Date(integration.last_synced_at).toLocaleString("pt-BR")}
              </div>
            )}

            <ScopesDisplay scopes={integration.scopes} />
            <Separator className="bg-border/50" />
          </>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {(status === "disconnected" || status === "error") && (
            <Button
              onClick={connect}
              disabled={loading || status === "connecting"}
              className="gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              Conectar TikTok
            </Button>
          )}

          {status === "connecting" && (
            <Button disabled className="gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Conectando...
            </Button>
          )}

          {(status === "connected" || status === "expired") && (
            <>
              {status === "expired" && (
                <Button onClick={refresh} disabled={loading} variant="default" className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Renovar Token
                </Button>
              )}
              <Button onClick={connect} disabled={loading} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reconectar
              </Button>
              <Button onClick={disconnect} disabled={loading} variant="ghost" className="gap-2 text-destructive hover:text-destructive">
                <Unlink className="w-4 h-4" />
                Desconectar
              </Button>
            </>
          )}
        </div>

        {/* Logs */}
        <ConnectionLogs logs={logs} />
      </CardContent>
    </Card>
  );
}
