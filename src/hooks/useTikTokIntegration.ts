import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { LogEntry } from "@/components/integrations/ConnectionLogs";
import type { ConnectionStatus } from "@/components/integrations/ConnectionStatusBadge";

export interface TikTokIntegration {
  provider_user_id: string | null;
  scopes: string[];
  connected_at: string | null;
  last_synced_at: string | null;
  expires_at: string | null;
  status: string;
}

interface UseTikTokIntegrationReturn {
  status: ConnectionStatus;
  integration: TikTokIntegration | null;
  loading: boolean;
  error: string | null;
  logs: LogEntry[];
  isMock: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

function addLog(setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>, message: string, type: LogEntry["type"]) {
  setLogs((prev) => [{ timestamp: new Date().toISOString(), message, type }, ...prev].slice(0, 20));
}

export function useTikTokIntegration(): UseTikTokIntegrationReturn {
  const { user } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [integration, setIntegration] = useState<TikTokIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMock, setIsMock] = useState(false);

  const userId = user?.user_id?.toString();

  const fetchStatus = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      // Try edge function first
      const { data, error: fnError } = await supabase.functions.invoke("tiktok-connect", {
        method: "GET",
        body: { action: "status", user_id: userId },
      });

      if (fnError) throw fnError;

      if (data?.mock) {
        setIsMock(true);
        // Check if there's a mock integration in DB
        const { data: dbRow } = await supabase
          .from("oauth_integrations")
          .select("*")
          .eq("user_id", userId)
          .eq("provider", "tiktok")
          .maybeSingle();

        if (dbRow && dbRow.status === "connected") {
          setStatus("connected");
          setIntegration({
            provider_user_id: dbRow.provider_user_id,
            scopes: dbRow.scopes || [],
            connected_at: dbRow.connected_at,
            last_synced_at: dbRow.last_synced_at,
            expires_at: dbRow.expires_at,
            status: dbRow.status,
          });
        } else {
          setStatus("disconnected");
          setIntegration(null);
        }
      } else if (data?.integration) {
        const int = data.integration;
        const now = new Date();
        const isExpired = int.expires_at && new Date(int.expires_at) < now;

        setStatus(isExpired ? "expired" : (int.status as ConnectionStatus));
        setIntegration(int);
        setIsMock(false);
      } else {
        setStatus("disconnected");
        setIntegration(null);
      }
    } catch {
      // Fallback: query DB directly
      if (!userId) return;
      const { data: dbRow } = await supabase
        .from("oauth_integrations")
        .select("*")
        .eq("user_id", userId)
        .eq("provider", "tiktok")
        .maybeSingle();

      setIsMock(true);
      if (dbRow && dbRow.status === "connected") {
        setStatus("connected");
        setIntegration({
          provider_user_id: dbRow.provider_user_id,
          scopes: dbRow.scopes || [],
          connected_at: dbRow.connected_at,
          last_synced_at: dbRow.last_synced_at,
          expires_at: dbRow.expires_at,
          status: dbRow.status,
        });
      } else {
        setStatus("disconnected");
        setIntegration(null);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const connect = useCallback(async () => {
    if (!userId) return;
    setStatus("connecting");
    setError(null);
    addLog(setLogs, "Iniciando conexão com TikTok...", "info");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("tiktok-connect", {
        body: { action: "connect", user_id: userId },
      });

      if (fnError) throw fnError;

      if (data?.mock) {
        setIsMock(true);
        addLog(setLogs, "Modo demo: simulando fluxo OAuth...", "warning");
        // Simulate redirect delay then mock callback
        await new Promise((r) => setTimeout(r, 2000));

        // Insert mock integration
        await supabase.from("oauth_integrations").upsert({
          user_id: userId,
          provider: "tiktok",
          provider_user_id: "mock_user_tiktok",
          access_token: "mock_access_token",
          refresh_token: "mock_refresh_token",
          scopes: ["user.info.basic", "user.info.profile", "video.list"],
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          connected_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
          status: "connected",
        }, { onConflict: "user_id,provider" });

        setStatus("connected");
        setIntegration({
          provider_user_id: "mock_user_tiktok",
          scopes: ["user.info.basic", "user.info.profile", "video.list"],
          connected_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          status: "connected",
        });
        addLog(setLogs, "Conexão demo estabelecida com sucesso!", "success");
      } else if (data?.auth_url) {
        addLog(setLogs, "Redirecionando para TikTok...", "info");
        window.location.href = data.auth_url;
      }
    } catch (e: any) {
      setStatus("error");
      const msg = e?.message || "Falha ao conectar com TikTok";
      setError(msg);
      addLog(setLogs, msg, "error");
    }
  }, [userId]);

  const disconnect = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    addLog(setLogs, "Desconectando TikTok...", "info");

    try {
      await supabase
        .from("oauth_integrations")
        .update({ status: "disconnected", access_token: null, refresh_token: null })
        .eq("user_id", userId)
        .eq("provider", "tiktok");

      setStatus("disconnected");
      setIntegration(null);
      setError(null);
      addLog(setLogs, "TikTok desconectado com sucesso.", "success");
    } catch (e: any) {
      addLog(setLogs, e?.message || "Erro ao desconectar", "error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    addLog(setLogs, "Renovando token...", "info");

    try {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 1500));
        const newExpiry = new Date(Date.now() + 86400000).toISOString();
        await supabase
          .from("oauth_integrations")
          .update({ expires_at: newExpiry, status: "connected", updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("provider", "tiktok");

        setStatus("connected");
        setIntegration((prev) => prev ? { ...prev, expires_at: newExpiry, status: "connected" } : prev);
        addLog(setLogs, "Token renovado (demo)!", "success");
      } else {
        const { data, error: fnError } = await supabase.functions.invoke("tiktok-refresh", {
          body: { user_id: userId },
        });
        if (fnError) throw fnError;
        await fetchStatus();
        addLog(setLogs, "Token renovado com sucesso!", "success");
      }
    } catch (e: any) {
      addLog(setLogs, e?.message || "Erro ao renovar token", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, isMock, fetchStatus]);

  return { status, integration, loading, error, logs, isMock, connect, disconnect, refresh };
}
