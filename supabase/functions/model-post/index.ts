import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SYSTEM_PROMPT_BASE } from "../_shared/knowledge_base.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, niche, goal, tone, audience } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: "Imagem é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const contextParts: string[] = [];
    if (niche) contextParts.push(`Nicho/negócio do usuário: ${niche}`);
    if (goal) contextParts.push(`Objetivo do post: ${goal}`);
    if (tone) contextParts.push(`Tom de voz desejado: ${tone}`);
    if (audience) contextParts.push(`Público-alvo: ${audience}`);

    const contextBlock = contextParts.length > 0
      ? `\n\nCONTEXTO DO USUÁRIO:\n${contextParts.join("\n")}`
      : "";

    const userContent: any[] = [
      {
        type: "image_url",
        image_url: { url: imageBase64 },
      },
      {
        type: "text",
        text: `Analise esta imagem de um post do Instagram e gere um conteúdo modelado/adaptado para o contexto do usuário.${contextBlock}

Você DEVE retornar um JSON com EXATAMENTE esta estrutura:

{
  "parteVisual": "A frase ou título impactante do INÍCIO da copy que será usada como texto principal na imagem do post. Deve ser curta (1-3 linhas), chamativa e funcionar sozinha como headline visual. Transcreva com 100% de precisão, mantendo emojis.",
  "descricaoPost": "O RESTANTE da copy que não foi usado na parte visual: corpo do texto, call-to-action, hashtags. Este texto será exibido como legenda/descrição do post. Inclua hashtags relevantes no final.",
  "copyModelado": "Texto COMPLETO da copy (parteVisual + descricaoPost juntos). Copy pronta para uso com emojis, hashtags, quebras de linha e call-to-action. Mínimo 3 parágrafos.",
  "gatilhosUtilizados": [
    {
      "nome": "Nome do gatilho mental (ex: Escassez, Prova Social, Autoridade, Reciprocidade, Curiosidade, etc.)",
      "explicacao": "Explicação de como e onde esse gatilho foi aplicado na copy modelada"
    }
  ]
}

REGRAS:
- A copy DEVE ser adaptada ao nicho, tom e público-alvo fornecidos.
- "parteVisual" deve conter APENAS o título/headline impactante do início. Texto curto e direto.
- "descricaoPost" deve conter todo o restante: corpo, CTA, hashtags.
- Inclua pelo menos 3 gatilhos mentais relevantes.
- Transcreva com 100% de precisão ortográfica. Sem erros de digitação.
- Mantenha todos os emojis.
- PROIBIDO incluir nomes de usuário, @ handles, perfis ou qualquer identificação do post original na copy gerada.
- Retorne APENAS JSON válido, sem markdown, sem code fences.`,
      },
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `${SYSTEM_PROMPT_BASE}

## SUA TAREFA: MODELAGEM DE POST

Você analisa imagens de posts e cria conteúdo adaptado ao contexto do usuário, aplicando os frameworks acima.
• Use a estrutura P-C-R para construir a copy (Pergunta/Hook → Conflito → Resposta/CTA)
• Inclua pelo menos um pico emocional na copy
• Alinhe o conteúdo ao ICP e nicho do usuário
• Sempre responda com JSON válido. Nunca inclua markdown ou code fences.`,
            },
            {
              role: "user",
              content: userContent,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);
      let errorMsg = "Falha na análise da IA";
      if (response.status === 429) errorMsg = "Limite de requisições excedido. Tente novamente em alguns instantes.";
      if (response.status === 402) errorMsg = "Créditos insuficientes. Verifique seu plano.";
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ success: false, error: "Falha ao interpretar resposta da IA", raw: content }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result: parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("model-post error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
