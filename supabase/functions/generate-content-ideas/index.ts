import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCreatorRAGContext, DIRETRIZES_CRIATIVAS, EXEMPLOS_VIRAIS, BENCHMARKS_NICHO } from "../_shared/knowledge_base.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type CreatorProfile = {
  niche?: string;
  target_audience?: string;
  content_style?: string;
  tone_of_voice?: string;
};

type HistoryItem = {
  tipo: string;
  titulo: string;
  payload?: Record<string, unknown> | null;
};

function buildFallbackIdeas(profile?: CreatorProfile | null, history: HistoryItem[] = []) {
  const niche = profile?.niche || "negócios";
  const audience = profile?.target_audience || "pessoas iniciantes";
  const style = profile?.content_style || "direto";

  const recentTopics = history
    .map((h) => h?.titulo?.trim())
    .filter(Boolean)
    .slice(0, 3);

  const topicHint = recentTopics.length > 0 ? ` usando temas como ${recentTopics.join(", ")}` : "";

  return [
    {
      title: `3 erros que travam seu crescimento em ${niche}`,
      angle: `Mostrar erros simples e práticos que quem está começando comete, e como corrigir rápido.${topicHint}`,
      hook: `Se você está tentando crescer em ${niche}, talvez esteja cometendo esse erro sem perceber.`,
      format: "lista",
      category: "lista",
      why_now: "Conteúdo de erro + correção costuma gerar boa retenção e compartilhamento.",
      target_emotion: "identificação",
    },
    {
      title: `O passo a passo que eu usaria para começar do zero em ${niche}`,
      angle: `Explicar um plano simples de execução para ${audience}, sem complicar com teoria.`,
      hook: `Se eu tivesse que recomeçar hoje do zero, eu faria exatamente isso.`,
      format: "tutorial",
      category: "tutorial",
      why_now: "Conteúdos práticos tendem a performar bem para audiência iniciante.",
      target_emotion: "esperança",
    },
    {
      title: `O que ninguém te conta sobre crescer em ${niche}`,
      angle: `Quebrar expectativas com um ponto contraintuitivo e mostrar a visão real de quem executa.`,
      hook: `Tem uma verdade sobre crescer em ${niche} que quase ninguém fala.`,
      format: "storytelling",
      category: "storytelling",
      why_now: "Conteúdo com bastidor e verdade prática aumenta confiança no criador.",
      target_emotion: "curiosidade",
    },
    {
      title: `Reagindo a conselhos ruins de ${niche}`,
      angle: `Pegar conselhos comuns, mostrar por que falham e substituir por versão simples que funciona.`,
      hook: `Esse conselho parece bom, mas pode atrasar muito seu resultado.`,
      format: "reação",
      category: "reação",
      why_now: "Formatos de reação ajudam a prender atenção e gerar comentários.",
      target_emotion: "revolta",
    },
    {
      title: `Bastidores: como eu estruturaria 7 dias de conteúdo em ${style}`,
      angle: `Mostrar organização real de produção com foco em consistência e execução diária.`,
      hook: `Quer postar mais sem travar? Esse é meu método simples de 7 dias.`,
      format: "bastidores",
      category: "bastidores",
      why_now: "Bastidores aproximam o público e elevam percepção de autoridade.",
      target_emotion: "confiança",
    },
    {
      title: `Comparação real: estratégia A vs estratégia B em ${niche}`,
      angle: `Comparar duas abordagens populares com critérios simples: tempo, custo e resultado provável.`,
      hook: `Se você só pudesse escolher uma estratégia hoje, qual realmente vale mais a pena?`,
      format: "comparação",
      category: "comparação",
      why_now: "Comparações geram debate e aumentam interação orgânica.",
      target_emotion: "clareza",
    },
  ];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, prompt_context, preferred_format, preferred_tone, avoid_topics, existing_titles, dismissed_titles } = await req.json();
    if (!user_id) throw new Error("user_id obrigatório");

    const isAppendMode = Array.isArray(existing_titles) && existing_titles.length > 0;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada");
    const OPENAI_PROJECT_KEY = Deno.env.get("OPENAI_PROJECT_KEY") || "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("creator_profiles")
      .select("*")
      .eq("user_id", String(user_id))
      .maybeSingle();

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

    const systemPrompt = `Você é um estrategista de conteúdo de ELITE para criadores de vídeos curtos (TikTok, Reels, Shorts).

## TOM DE LINGUAGEM (OBRIGATÓRIO)
Escreva como se estivesse explicando para um criador INICIANTE que nunca estudou marketing.
• NÃO use jargões técnicos como "pattern interrupts", "open loops", "micro-hooks"
• Use frases curtas e diretas, como se estivesse conversando
• Dê exemplos práticos sempre que possível

${DIRETRIZES_CRIATIVAS}

${EXEMPLOS_VIRAIS}

${BENCHMARKS_NICHO}

${creatorContext}`;

    const ideaCount = isAppendMode ? "exatamente 3" : "entre 6 e 10";

    let appendContext = "";
    if (isAppendMode) {
      appendContext += `\n## IDEIAS JÁ EXISTENTES (NÃO REPITA NENHUMA):\n${(existing_titles as string[]).map((t: string) => `- ${t}`).join("\n")}`;
    }
    if (Array.isArray(dismissed_titles) && dismissed_titles.length > 0) {
      appendContext += `\n\n## IDEIAS DESCARTADAS PELO CRIADOR (entenda o padrão do que ele NÃO gosta e evite ideias similares):\n${(dismissed_titles as string[]).map((t: string) => `- ${t}`).join("\n")}`;
    }

    let specificRequest = "";
    if (prompt_context) specificRequest += `\n\n## PEDIDO ESPECÍFICO DO CRIADOR:\n"${prompt_context}"\nAs ideias DEVEM estar alinhadas com esse pedido.`;
    if (preferred_format) specificRequest += `\n\nFORMATO PREFERIDO: Foque no formato "${preferred_format}".`;
    if (preferred_tone) specificRequest += `\n\nTOM PEDIDO: Use o tom "${preferred_tone}".`;
    if (avoid_topics) specificRequest += `\n\nEVITAR: O criador pediu para NÃO gerar ideias sobre: "${avoid_topics}".`;

    const userPrompt = `Com base no histórico, perfil e nos frameworks acima, gere ${ideaCount} ideias de conteúdo para vídeos curtos.

## CONTEXTO DO CRIADOR (PRIORIDADE MÁXIMA)
O criador tem o seguinte perfil — TODAS as ideias devem ser 100% relevantes para esse nicho e público:
- Nicho: ${profile?.niche || "geral"}
- Sub-nichos: ${(profile as any)?.sub_niches?.join(", ") || "não informado"}
- Público-alvo: ${profile?.target_audience || "geral"}
- Estilo de conteúdo: ${profile?.content_style || "natural"}
- Tom de voz: ${profile?.tone_of_voice || "conversacional"}
- Plataformas: ${(profile as any)?.main_platforms?.join(", ") || "não informado"}
- Objetivos: ${(profile as any)?.goals || "não informado"}

## Histórico recente do criador:
${historyContext || "Nenhum histórico encontrado — gere ideias baseadas apenas no perfil."}
${appendContext}${specificRequest}

## REGRAS DE QUALIDADE (OBRIGATÓRIO)
1. **100% no nicho do criador**: Cada ideia DEVE ser específica para o nicho "${profile?.niche || "geral"}" e falar diretamente com "${profile?.target_audience || "o público-alvo"}". NÃO gere ideias genéricas sobre empreendedorismo, produtividade ou finanças se o nicho do criador for outro.
2. **Ângulos contraintuitivos**: Cada ideia DEVE ter um ângulo que vá contra o senso comum ou surpreenda. Nada de ângulos óbvios como "a importância de X" ou "como fazer Y".
3. **Hooks prontos para gravar**: O hook deve ser uma FRASE EXATA que o criador vai falar olhando pra câmera. Deve soar natural e falado.
4. **Categorias válidas**: O campo "category" DEVE ser um destes valores exatos: tutorial, storytelling, polemica, bastidores, lista, reacao, comparacao, desafio, tendencia. NÃO use outros valores. Use SEM acento.
5. **Especificidade**: Ideias devem parecer VIVIDAS e ESPECÍFICAS ao nicho do criador. Use números concretos, situações reais, exemplos do cotidiano do público-alvo.
6. **Distribuição de propósito**: Misture ideias de alcance (atrair novos seguidores), autoridade (posicionamento) e conversão (vendas), mas use as categorias de FORMATO listadas acima.

## EXEMPLO DO NÍVEL ESPERADO (few-shot)
✅ BOM:
- title: "Parei de postar todo dia e minhas views triplicaram"
- angle: "Mostrar que volume sem estratégia queima o perfil e que 3 vídeos/semana com formato eficiente batem 7 vídeos genéricos"
- hook: "Eu postava todo dia e meu perfil só caía. Até que eu fiz o oposto."
- category: "storytelling"

❌ RUIM (genérico demais):
- title: "Dicas para crescer nas redes sociais"
- angle: "Compartilhar dicas úteis para o público"
- hook: "Você quer crescer nas redes? Então assista esse vídeo."
- category: "Atracao" ← ERRADO, use valores do enum

Gere ideias no nível do exemplo BOM, todas profundamente conectadas ao nicho do criador.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Project": OPENAI_PROJECT_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 3000,
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
        const fallbackIdeas = buildFallbackIdeas(profile, history as HistoryItem[]);
        return new Response(JSON.stringify({
          ideas: fallbackIdeas,
          fallback: true,
          warning: "Sem créditos de IA no momento. Geramos ideias inteligentes de fallback com base no seu perfil e histórico.",
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
