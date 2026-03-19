import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCreatorRAGContext } from "../_shared/knowledge_base.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id obrigatório");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Buscar perfil do criador
    const { data: profile } = await supabase
      .from("creator_profiles")
      .select("*")
      .eq("user_id", String(user_id))
      .maybeSingle();

    // Buscar últimos 20 itens do histórico
    const { data: history } = await supabase
      .from("user_history")
      .select("tipo, titulo, payload, created_at")
      .eq("user_id", String(user_id))
      .order("created_at", { ascending: false })
      .limit(20);

    const creatorContext = buildCreatorRAGContext(profile || undefined);

    const historyContext = (history || []).map((h: any) => {
      const payload = h.payload || {};
      return `- [${h.tipo}] "${h.titulo}" — ${payload.summary || payload.titulo || ""}`;
    }).join("\n");

    const systemPrompt = `Você é um estrategista de conteúdo para criadores de vídeos curtos (TikTok, Reels, Shorts).

## TOM DE LINGUAGEM (OBRIGATÓRIO)
Escreva como se estivesse explicando para um criador INICIANTE que nunca estudou marketing.
• NÃO use jargões técnicos
• Use frases curtas e diretas, como se estivesse conversando
• Dê exemplos práticos sempre que possível

${creatorContext}`;

    const userPrompt = `Com base no histórico e perfil deste criador, gere entre 6 e 10 ideias de conteúdo para vídeos curtos.

## Histórico recente do criador:
${historyContext || "Nenhum histórico encontrado — gere ideias baseadas apenas no perfil."}

## Perfil:
- Nicho: ${profile?.niche || "geral"}
- Público-alvo: ${profile?.target_audience || "geral"}
- Estilo: ${profile?.content_style || "natural"}
- Tom de voz: ${profile?.tone_of_voice || "conversacional"}

Gere ideias VARIADAS em categorias diferentes. Cada ideia deve ser prática e fácil de executar.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_content_ideas",
              description: "Retorna uma lista de ideias de conteúdo para vídeos curtos.",
              parameters: {
                type: "object",
                properties: {
                  ideas: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Título curto e chamativo da ideia" },
                        angle: { type: "string", description: "Ângulo/abordagem do vídeo em 1-2 frases" },
                        hook: { type: "string", description: "Frase de abertura sugerida para prender atenção" },
                        format: { type: "string", description: "Formato sugerido: tutorial, storytelling, polêmica, bastidores, lista, reação, comparação, desafio" },
                        category: { type: "string", enum: ["tutorial", "storytelling", "polêmica", "bastidores", "lista", "reação", "comparação", "desafio", "tendência"] },
                        why_now: { type: "string", description: "Por que essa ideia é relevante agora (1 frase)" },
                        target_emotion: { type: "string", description: "Emoção principal que o vídeo deve causar" },
                      },
                      required: ["title", "angle", "hook", "format", "category", "why_now", "target_emotion"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["ideas"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_content_ideas" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações. Aguarde um momento e tente novamente." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("Resposta inesperada da IA");

    const ideas = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(ideas), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content-ideas error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
