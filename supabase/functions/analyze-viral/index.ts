import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SYSTEM_PROMPT_BASE, FRAMEWORK_ROTEIROS, DIRETRIZES_CRIATIVAS } from "../_shared/knowledge_base.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Etapa 1: Baixa o vídeo da URL pública e faz upload para a Gemini File API.
 * Retorna a URI interna do Google para uso em generateContent.
 */
async function uploadToGeminiFileAPI(publicUrl: string, apiKey: string): Promise<{ fileUri: string; mimeType: string }> {
  // 1. Fetch do arquivo a partir da URL pública
  console.log("[Gemini File API] Baixando arquivo de:", publicUrl);
  const fileResponse = await fetch(publicUrl);
  if (!fileResponse.ok) {
    throw new Error(`Falha ao baixar arquivo: ${fileResponse.status} ${fileResponse.statusText}`);
  }

  const fileBuffer = await fileResponse.arrayBuffer();
  const mimeType = fileResponse.headers.get("content-type") || "video/mp4";
  const fileSizeMB = (fileBuffer.byteLength / (1024 * 1024)).toFixed(2);
  console.log(`[Gemini File API] Arquivo baixado: ${fileSizeMB}MB, mimeType: ${mimeType}`);

  // 2. Upload para a Gemini File API
  const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${apiKey}`;

  console.log("[Gemini File API] Enviando arquivo para Google File API...");
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": mimeType,
      "X-Goog-Upload-Command": "upload, finalize",
      "X-Goog-Upload-Header-Content-Type": mimeType,
      "X-Goog-Upload-Protocol": "raw",
    },
    body: fileBuffer,
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    console.error("[Gemini File API] Erro no upload:", uploadResponse.status, errText);
    throw new Error(`Falha no upload para Gemini File API: ${uploadResponse.status} - ${errText}`);
  }

  const uploadData = await uploadResponse.json();
  const fileUri = uploadData?.file?.uri;

  if (!fileUri) {
    console.error("[Gemini File API] Resposta sem URI:", JSON.stringify(uploadData));
    throw new Error("Gemini File API não retornou uma URI válida");
  }

  console.log(`[Gemini File API] ✅ Upload concluído! URI: ${fileUri}`);
  return { fileUri, mimeType };
}

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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    // =============================================
    // AGENTE 1: GEMINI — Extração e análise bruta
    // =============================================

    const geminiSystemPrompt = `${SYSTEM_PROMPT_BASE}

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

    // Etapa 1 & 2: Se temos URL de vídeo, fazer upload via Gemini File API
    if (url && (isVideoUpload || url.startsWith("http"))) {
      console.log("[Pipeline] Iniciando upload do vídeo para Gemini File API...");
      const { fileUri, mimeType } = await uploadToGeminiFileAPI(url, GEMINI_API_KEY);

      parts.push({ fileData: { mimeType, fileUri } });
      parts.push({
        text: isVideoUpload
          ? `Analise o potencial viral deste vídeo enviado. Assista ao vídeo completo e analise cada parte: hook, corpo e CTA. Use tags temporais [MM:SS] em todas as observações.\n\nDescrição adicional do criador: ${description || "Nenhuma fornecida. Baseie sua análise no que você vê e ouve no vídeo."}`
          : `Analise o potencial viral deste conteúdo. Assista ao vídeo e analise cada parte com tags temporais.\n\nDescrição adicional: ${description || "Nenhuma"}`,
      });
    } else {
      parts.push({
        text: `Analise o potencial viral deste conteúdo com base na descrição: ${description}. Estime tags temporais com base na estrutura descrita.`,
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    console.log("[Pipeline] Chamando Gemini generateContent...");
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: geminiSystemPrompt }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      let errorMsg = "Erro na análise de IA (Gemini)";
      if (geminiResponse.status === 429) errorMsg = "Limite de requisições Gemini excedido. Tente novamente em instantes.";
      if (geminiResponse.status === 403) errorMsg = "Chave Gemini inválida ou sem permissão.";
      return new Response(JSON.stringify({ success: false, error: errorMsg }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await geminiResponse.json();
    const geminiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let geminiAnalysis;
    try {
      const cleaned = geminiContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      geminiAnalysis = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini response:", geminiContent);
      return new Response(JSON.stringify({ success: false, error: "Falha ao interpretar resposta do Gemini", raw: geminiContent }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[Pipeline] Agente 1 (Gemini) concluído. Enviando para Agente 2 (OpenAI)...");

    // =============================================
    // AGENTE 2: OPENAI — Avaliação estratégica RAG
    // =============================================

    const openaiSystemPrompt = `Você é o Analista Viral Sênior do Viralize AI.

Use o contexto fornecido pelo nosso agente de extração (Gemini) e avalie o potencial viral do conteúdo baseando-se ESTRITAMENTE nestes dois documentos metodológicos:

---
${FRAMEWORK_ROTEIROS}
---
${DIRETRIZES_CRIATIVAS}
---

## INSTRUÇÕES

1. Analise o JSON de extração do Gemini fornecido pelo usuário.
2. Cruze cada ponto da análise com os frameworks acima (estrutura P-C-R, picos emocionais, formato eficiente, ICP, linhas de conteúdo, regra dos 70%).
3. Gere um veredito final com score próprio e um roteiro melhorado.

## OUTPUT

Retorne APENAS um JSON válido com esta estrutura exata (sem markdown, sem code fences):

{
  "viralScore": number (0-100),
  "classification": "Baixo" | "Moderado" | "Alto" | "Viral",
  "summary": "string — resumo executivo da avaliação estratégica",
  "pontosFortes": ["string — cada ponto forte identificado, referenciando o framework"],
  "pontosFracos": ["string — cada ponto fraco identificado, referenciando o framework"],
  "hookAnalysis": { "score": number, "feedback": "string", "tips": ["string"] },
  "bodyAnalysis": { "score": number, "feedback": "string", "tips": ["string"] },
  "ctaAnalysis": { "score": number, "feedback": "string", "tips": ["string"] },
  "retentionKillers": ["string"],
  "retentionImprovements": ["string"],
  "roteiroMelhorado": {
    "hook": "string — frase/ação exata para os primeiros 3s usando estrutura P do P-C-R",
    "corpo": "string — estrutura do corpo usando Conflito do P-C-R com picos emocionais",
    "cta": "string — CTA otimizado usando Resposta do P-C-R",
    "legendas": ["string — 3 opções de legenda com hashtags"],
    "picoEmocional": "string — qual emoção principal explorar e como"
  },
  "scriptBlueprint": {
    "captions": ["string"],
    "exactHook": "string",
    "bodyPacing": [{ "timestamp": "string", "action": "string" }],
    "exactCta": "string"
  },
  "viralVideoIdeas": [{ "title": "string", "description": "string", "hookSuggestion": "string" }]
}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: openaiSystemPrompt },
          {
            role: "user",
            content: `Aqui está a análise bruta gerada pelo nosso Agente de Extração (Gemini). Avalie estrategicamente e gere o veredito final:\n\n${JSON.stringify(geminiAnalysis, null, 2)}`,
          },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errText);
      // Fallback: retorna a análise do Gemini se OpenAI falhar
      console.warn("Fallback: retornando análise do Gemini sem refinamento.");
      return new Response(JSON.stringify({ success: true, analysis: geminiAnalysis, fallback: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiData = await openaiResponse.json();
    const openaiContent = openaiData.choices?.[0]?.message?.content || "";

    let finalAnalysis;
    try {
      finalAnalysis = JSON.parse(openaiContent);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", openaiContent);
      return new Response(JSON.stringify({ success: true, analysis: geminiAnalysis, fallback: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[Pipeline] ✅ Agente 2 (OpenAI) concluído. Pipeline multi-agente finalizado.");

    return new Response(JSON.stringify({ success: true, analysis: finalAnalysis }), {
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
