import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type CallbackState = "processing" | "success" | "error";

export default function TikTokCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>("processing");
  const [errorMsg, setErrorMsg] = useState("");

  const code = searchParams.get("code");
  const oauthState = searchParams.get("state");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    async function handleCallback() {
      // Error from TikTok
      if (errorParam) {
        setErrorMsg(errorParam === "access_denied" ? "Acesso negado pelo usuário." : `Erro do TikTok: ${errorParam}`);
        setState("error");
        return;
      }

      // Missing code
      if (!code) {
        setErrorMsg("Código de autorização ausente na resposta.");
        setState("error");
        return;
      }

      // Missing state
      if (!oauthState) {
        setErrorMsg("Parâmetro state inválido — possível tentativa CSRF.");
        setState("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("tiktok-callback", {
          body: { code, state: oauthState },
        });

        if (error) throw error;

        if (data?.mock) {
          // Mock mode: simulate success
          await new Promise((r) => setTimeout(r, 1500));
        }

        setState("success");
        // Redirect after success
        setTimeout(() => navigate("/perfil", { replace: true }), 2000);
      } catch (e: any) {
        setErrorMsg(e?.message || "Falha ao processar autorização.");
        setState("error");
      }
    }

    handleCallback();
  }, [code, oauthState, errorParam, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {state === "processing" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Processando autorização...</h1>
            <p className="text-sm text-muted-foreground">Estamos finalizando a conexão com o TikTok.</p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Conexão concluída!</h1>
            <p className="text-sm text-muted-foreground">Sua conta TikTok foi conectada com sucesso. Redirecionando...</p>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold text-foreground">Falha na autorização</h1>
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            <Button onClick={() => navigate("/perfil")} variant="outline">
              Voltar ao Perfil
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
