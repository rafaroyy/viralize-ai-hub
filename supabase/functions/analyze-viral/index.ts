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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

## SUA TAREFA: ANÁLISE VIRAL DE VÍDEO

Você DEVE retornar sua análise como um JSON válido seguindo a estrutura especificada abaixo.

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

Nota geral 0-100. Classificação: "Baixo" (0-30), "Moderado" (31-60), "Alto" (61-80), "Viral" (81-100).

Retorne APENAS JSON válido com esta estrutura exata:
{
  "overallScore": number,
  "classification": "Baixo" | "Moderado" | "Alto" | "Viral",
  "summary": "string",
  "hookAnalysis": { "score": number, "feedback": "string", "tips": ["string"] },
  "bodyAnalysis": { "score": number, "feedback": "string", "tips": ["string"] },
  "ctaAnalysis": { "score": number, "feedback": "string", "tips": ["string"] },
  "retentionKillers": ["string"],
  "retentionImprovements": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "scriptBlueprint": {
    "captions": ["string"],
    "exactHook": "string",
    "bodyPacing": [{ "timestamp": "string", "action": "string" }],
    "exactCta": "string"
  },
  "viralVideoIdeas": [{ "title": "string", "description": "string", "hookSuggestion": "string" }]
}

Sem markdown, sem code fences. APENAS JSON válido.`;

    // Build Gemini API request parts
    const parts: any[] = [];

    if (url && isVideoUpload) {
      parts.push({ fileData: { mimeType: "video/mp4", fileUri: url } });
      parts.push({
        text: `Analise o potencial viral deste vídeo enviado. Assista ao vídeo completo e analise cada parte: hook, corpo e CTA. Use tags temporais [MM:SS] em todas as observações.\n\nDescrição adicional do criador: ${description || "Nenhuma fornecida. Baseie sua análise no que você vê e ouve no vídeo."}`,
      });
    } else if (url) {
      parts.push({ fileData: { mimeType: "video/mp4", fileUri: url } });
      parts.push({
        text: `Analise o potencial viral deste conteúdo. Assista ao vídeo e analise cada parte com tags temporais.\n\nDescrição adicional: ${description || "Nenhuma"}`,
      });
    } else {
      parts.push({
        text: `Analise o potencial viral deste conteúdo com base na descrição: ${description}. Estime tags temporais com base na estrutura descrita.`,
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      let errorMsg = "Erro na análise de IA";
      if (response.status === 429) errorMsg = "Limite de requisições excedido. Tente novamente em instantes.";
      if (response.status === 403) errorMsg = "Chave de API inválida ou sem permissão.";
      return new Response(JSON.stringify({ success: false, error: errorMsg }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let analysis;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini response:", content);
      return new Response(JSON.stringify({ success: false, error: "Falha ao interpretar resposta da IA", raw: content }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-viral error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
