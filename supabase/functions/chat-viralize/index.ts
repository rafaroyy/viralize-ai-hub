import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o assistente oficial da Viralize IA, uma plataforma de criação de vídeos virais com inteligência artificial.

Você é um especialista em:
- Criação de vídeos virais para TikTok, Instagram Reels, YouTube Shorts e outras redes sociais
- Estratégias de monetização de conteúdo em vídeo
- Técnicas de storytelling e roteiro para vídeos curtos
- Tendências de conteúdo e algoritmos de redes sociais
- Marketing digital e growth hacking com vídeos

Sobre a ferramenta Viralize IA:
- Permite criar vídeos com IA usando avatares realistas
- Oferece modelos prontos de vídeos virais
- Tem análise inteligente de roteiros
- Suporta vídeos de 10s, 20s e 30s com múltiplas cenas
- Aceita vídeos personalizados do usuário (recomendado: 4 vídeos de 5 segundos)

Regras:
- Responda sempre em português brasileiro
- Seja direto, prático e entusiasmado
- Use emojis com moderação para tornar a conversa mais dinâmica
- Forneça dicas acionáveis e específicas
- Quando relevante, sugira funcionalidades da plataforma Viralize IA
- Use formatação markdown (negrito, listas, etc.) para organizar suas respostas`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const projectKey = Deno.env.get("OPENAI_PROJECT_KEY");

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (projectKey) {
      headers["OpenAI-Project"] = projectKey;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao comunicar com a IA. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
