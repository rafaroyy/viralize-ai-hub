import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SYSTEM_PROMPT_BASE } from "../_shared/knowledge_base.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, description, isVideoUpload } = await req.json();
    if (!url && !description) {
      return new Response(JSON.stringify({ success: false, error: "URL, descrição ou vídeo é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

## SUA TAREFA: ANÁLISE VIRAL DE VÍDEO

Você DEVE usar a função analyze_viral para retornar sua análise.

### Regras de formatação

• **Bullet points**: TODOS os feedbacks DEVEM ser em bullet points curtos com "• " no início
• **Negrito**: Destaque palavras-chave com **negrito**
• **Tags temporais**: Ancore observações em [MM:SS - MM:SS]
• Sempre avalie usando a estrutura P-C-R (Pergunta/Hook → Conflito/Corpo → Resposta/CTA)
• Identifique picos emocionais (ou a falta deles) conforme o framework

### Análise em 3 partes

**1. HOOK (Primeiros 3s)** — Equivale ao "P" (Pergunta) do framework P-C-R
• Prende atenção? Usa curiosidade, choque, promessa?
• Score 0-100

**2. CORPO** — Equivale ao "C" (Conflito) do framework P-C-R
• Entrega o que o hook prometeu?
• Mantém atenção com ritmo, cortes, micro-hooks?
• Score 0-100

**3. CTA / FINAL** — Equivale ao "R" (Resposta) do framework P-C-R
• Incentiva ação? Tem payoff ou cliffhanger?
• Score 0-100

### Análise de retenção
Identifique pontos que MATAM a retenção com tags temporais [MM:SS - MM:SS].

### Blueprint de execução
1. **Legendas**: 3 opções otimizadas com hashtags
2. **Hook exato**: Frase/ação EXATA para os primeiros 3s
3. **Corpo (Pacing)**: Estrutura de cortes com timestamps
4. **CTA exato**: Frase de conversão otimizada

Nota geral 0-100. Classificação: "Baixo" (0-30), "Moderado" (31-60), "Alto" (61-80), "Viral" (81-100).`;

    const userContent: any[] = [];

    if (url && isVideoUpload) {
      userContent.push({ type: "video_url", video_url: { url } });
      userContent.push({
        type: "text",
        text: `Analise o potencial viral deste vídeo enviado. Assista ao vídeo completo e analise cada parte: hook, corpo e CTA. Use tags temporais [MM:SS] em todas as observações.\n\nDescrição adicional do criador: ${description || "Nenhuma fornecida. Baseie sua análise no que você vê e ouve no vídeo."}`,
      });
    } else if (url) {
      userContent.push({ type: "video_url", video_url: { url } });
      userContent.push({
        type: "text",
        text: `Analise o potencial viral deste conteúdo. Assista ao vídeo e analise cada parte com tags temporais.\n\nDescrição adicional: ${description || "Nenhuma"}`,
      });
    } else {
      userContent.push({
        type: "text",
        text: `Analise o potencial viral deste conteúdo com base na descrição: ${description}. Estime tags temporais com base na estrutura descrita.`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_viral",
              description: "Return viral potential analysis with hook/body/cta breakdown, retention analysis, and execution blueprint",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "Overall viral score 0-100" },
                  classification: { type: "string", enum: ["Baixo", "Moderado", "Alto", "Viral"] },
                  summary: { type: "string", description: "Brief summary in Portuguese, 2-3 sentences" },
                  hookAnalysis: {
                    type: "object",
                    properties: {
                      score: { type: "number", description: "Hook score 0-100" },
                      feedback: { type: "string", description: "Bullet-point hook analysis with timestamps [MM:SS] and **bold** keywords. Use '• ' prefix per point." },
                      tips: { type: "array", items: { type: "string" }, description: "2-3 specific tips to improve hook" },
                    },
                    required: ["score", "feedback", "tips"],
                  },
                  bodyAnalysis: {
                    type: "object",
                    properties: {
                      score: { type: "number", description: "Body/content score 0-100" },
                      feedback: { type: "string", description: "Bullet-point body analysis with timestamps [MM:SS] and **bold** keywords. Use '• ' prefix per point." },
                      tips: { type: "array", items: { type: "string" }, description: "2-3 specific tips to improve body" },
                    },
                    required: ["score", "feedback", "tips"],
                  },
                  ctaAnalysis: {
                    type: "object",
                    properties: {
                      score: { type: "number", description: "CTA/ending score 0-100" },
                      feedback: { type: "string", description: "Bullet-point CTA analysis with timestamps [MM:SS] and **bold** keywords. Use '• ' prefix per point." },
                      tips: { type: "array", items: { type: "string" }, description: "2-3 specific tips to improve CTA" },
                    },
                    required: ["score", "feedback", "tips"],
                  },
                  retentionKillers: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific points that kill retention with timestamps [MM:SS - MM:SS], in Portuguese",
                  },
                  retentionImprovements: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific and actionable tips to improve retention with timestamps, in Portuguese",
                  },
                  strengths: { type: "array", items: { type: "string" }, description: "3-5 strengths in Portuguese" },
                  weaknesses: { type: "array", items: { type: "string" }, description: "3-5 weaknesses in Portuguese" },
                  scriptBlueprint: {
                    type: "object",
                    properties: {
                      captions: {
                        type: "array",
                        items: { type: "string" },
                        description: "3 optimized caption options for Instagram/TikTok with strategic hashtags, in Portuguese",
                      },
                      exactHook: {
                        type: "string",
                        description: "The EXACT phrase or action for the first 3 seconds. Be very specific, in Portuguese",
                      },
                      bodyPacing: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            timestamp: { type: "string", description: "Time range e.g. [00:03-00:08]" },
                            action: { type: "string", description: "What should happen in this cut, in Portuguese" },
                          },
                          required: ["timestamp", "action"],
                        },
                        description: "Recommended cut structure with timestamps",
                      },
                      exactCta: {
                        type: "string",
                        description: "The exact conversion phrase for the ending, in Portuguese",
                      },
                    },
                    required: ["captions", "exactHook", "bodyPacing", "exactCta"],
                  },
                  viralVideoIdeas: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short catchy title for the video idea in Portuguese" },
                        description: { type: "string", description: "1-2 sentence description of the video concept in Portuguese" },
                        hookSuggestion: { type: "string", description: "Specific hook phrase or opening for this video idea in Portuguese" },
                      },
                      required: ["title", "description", "hookSuggestion"],
                    },
                    description: "3-5 viral video ideas tailored to the creator's niche/content style",
                  },
                },
                required: ["overallScore", "classification", "summary", "hookAnalysis", "bodyAnalysis", "ctaAnalysis", "retentionKillers", "retentionImprovements", "strengths", "weaknesses", "scriptBlueprint", "viralVideoIdeas"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_viral" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ success: false, error: "Limite de requisições excedido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ success: false, error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Erro na análise de IA");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-viral error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
