import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCreatorRAGContext, FRAMEWORK_ROTEIROS, FRAMEWORK_RETENCAO, DIRETRIZES_CRIATIVAS } from "../_shared/knowledge_base.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { idea, customizations, user_id } = await req.json();
    if (!idea || !user_id) throw new Error("idea e user_id obrigatórios");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("creator_profiles")
      .select("*")
      .eq("user_id", String(user_id))
      .maybeSingle();

    const creatorContext = buildCreatorRAGContext(profile || undefined);

    // Merge customizations into idea
    const finalIdea = { ...idea, ...customizations };

    const systemPrompt = `Você é um roteirista especialista em vídeos curtos virais.

## TOM DE LINGUAGEM (OBRIGATÓRIO)
Escreva como se estivesse explicando para um criador INICIANTE que nunca estudou marketing.
• NÃO use jargões técnicos como "micro-hooks", "pattern interrupts", "open loops"
• SUBSTITUA por linguagem simples e direta
• Use frases curtas e diretas, como se estivesse conversando
• Dê exemplos práticos sempre que possível

${FRAMEWORK_ROTEIROS}

${FRAMEWORK_RETENCAO}

${DIRETRIZES_CRIATIVAS}

${creatorContext}`;

    const userPrompt = `Crie um roteiro completo para o seguinte vídeo curto:

**Título**: ${finalIdea.title}
**Ângulo**: ${finalIdea.angle}
**Hook sugerido**: ${finalIdea.hook}
**Formato**: ${finalIdea.format}
**Emoção-alvo**: ${finalIdea.target_emotion}
**Tom de voz desejado**: ${customizations?.tone || profile?.tone_of_voice || "conversacional"}
**Público-alvo**: ${customizations?.audience || profile?.target_audience || "geral"}

Gere o roteiro usando a ferramenta disponível. O roteiro deve ser prático, direto e pronto para gravar.`;

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
              name: "return_script",
              description: "Retorna o roteiro completo estruturado para um vídeo curto.",
              parameters: {
                type: "object",
                properties: {
                  hook: { type: "string", description: "Frase de abertura para prender atenção nos primeiros 3 segundos" },
                  body: {
                    type: "array",
                    description: "Corpo do roteiro dividido em blocos com timestamps",
                    items: {
                      type: "object",
                      properties: {
                        timestamp: { type: "string", description: "Ex: 0:03-0:08" },
                        text: { type: "string", description: "O que falar nesse momento" },
                        visual_tip: { type: "string", description: "Dica visual ou de edição para esse trecho" },
                      },
                      required: ["timestamp", "text"],
                      additionalProperties: false,
                    },
                  },
                  cta: { type: "string", description: "Convite para ação no final do vídeo" },
                  captions_suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 opções de legenda/caption para postar junto com o vídeo",
                  },
                  duration_suggestion: { type: "string", description: "Duração ideal sugerida (ex: 30-45 segundos)" },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 dicas práticas para gravar esse vídeo",
                  },
                },
                required: ["hook", "body", "cta", "captions_suggestions", "duration_suggestion"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_script" } },
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

    const script = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(script), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-script-from-idea error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
