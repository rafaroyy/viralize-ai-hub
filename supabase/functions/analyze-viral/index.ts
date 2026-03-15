import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SYSTEM_PROMPT_BASE, FRAMEWORK_ROTEIROS, DIRETRIZES_CRIATIVAS } from "../_shared/knowledge_base.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Faz upload do vídeo para a Gemini File API usando streaming direto (sem buffering em memória).
 * O body do fetch de download é passado diretamente como body do upload.
 */
async function streamUploadToGemini(publicUrl: string, apiKey: string): Promise<{ fileUri: string; mimeType: string }> {
  console.log("[Gemini File API] Iniciando stream upload de:", publicUrl);

  // 1. Iniciar download do vídeo (sem consumir o body — usar o stream)
  const fileResponse = await fetch(publicUrl);
  if (!fileResponse.ok) {
    throw new Error(`Falha ao baixar arquivo: ${fileResponse.status} ${fileResponse.statusText}`);
  }

  const mimeType = fileResponse.headers.get("content-type") || "video/mp4";
  const contentLength = fileResponse.headers.get("content-length");
  console.log(`[Gemini File API] mimeType: ${mimeType}, content-length: ${contentLength || "unknown"}`);

  // 2. Stream diretamente para a Gemini File API (zero buffering)
  const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${apiKey}`;

  const uploadHeaders: Record<string, string> = {
    "Content-Type": mimeType,
    "X-Goog-Upload-Command": "upload, finalize",
    "X-Goog-Upload-Header-Content-Type": mimeType,
    "X-Goog-Upload-Protocol": "raw",
  };
  if (contentLength) {
    uploadHeaders["Content-Length"] = contentLength;
  }

  console.log("[Gemini File API] Streaming para Google File API...");
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: uploadHeaders,
    body: fileResponse.body, // Stream direto — sem arrayBuffer()!
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    console.error("[Gemini File API] Erro no upload:", uploadResponse.status, errText);
    throw new Error(`Falha no upload para Gemini File API: ${uploadResponse.status} - ${errText}`);
  }

  const uploadData = await uploadResponse.json();
  const fileName = uploadData?.file?.name;
  const fileUri = uploadData?.file?.uri;

  if (!fileUri || !fileName) {
    console.error("[Gemini File API] Resposta sem URI/name:", JSON.stringify(uploadData));
    throw new Error("Gemini File API não retornou uma URI válida");
  }

  console.log(`[Gemini File API] Upload concluído. URI: ${fileUri}, state: ${uploadData?.file?.state}`);

  // 3. Polling: aguardar o arquivo ficar ACTIVE (intervalo reduzido de 3s→2s)
  const maxAttempts = 30;
  const pollInterval = 2000;
  for (let i = 0; i < maxAttempts; i++) {
    const statusUrl = `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`;
    const statusRes = await fetch(statusUrl);
    if (!statusRes.ok) {
      const errText = await statusRes.text();
      console.error(`[Gemini File API] Erro ao verificar status (tentativa ${i + 1}):`, errText);
      await new Promise(r => setTimeout(r, pollInterval));
      continue;
    }
    const statusData = await statusRes.json();
    const state = statusData?.state;
    console.log(`[Gemini File API] Polling ${i + 1}/${maxAttempts} — state: ${state}`);

    if (state === "ACTIVE") {
      console.log(`[Gemini File API] ✅ Arquivo ACTIVE!`);
      return { fileUri, mimeType };
    }
    if (state === "FAILED") {
      throw new Error("Gemini File API: processamento do arquivo falhou");
    }
    await new Promise(r => setTimeout(r, pollInterval));
  }

  throw new Error("Gemini File API: timeout aguardando arquivo ficar ACTIVE");
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

    // =============================================
    // CACHE: Verificar se já existe análise para esta URL
    // =============================================
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    if (url) {
      const { data: cached } = await sb
        .from("analysis_cache")
        .select("analysis")
        .eq("video_url", url)
        .maybeSingle();

      if (cached) {
        console.log("[Cache] ✅ Hit! Retornando análise cacheada.");
        return new Response(JSON.stringify({ success: true, analysis: cached.analysis, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log("[Cache] Miss. Iniciando pipeline completo.");
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

Retorne sua análise como JSON válido. Seja CONCISO — cada campo de texto deve ter no máximo 2 frases curtas.

### Análise em 3 partes (use estrutura P-C-R)

**1. HOOK (Primeiros 3s)** — "P" (Pergunta): Prende atenção? Score 0-100
**2. CORPO** — "C" (Conflito): Mantém atenção? Score 0-100
**3. CTA / FINAL** — "R" (Resposta): Incentiva ação? Score 0-100

### Regras
• Bullet points com "• " no início, **negrito** em palavras-chave
• Tags temporais [MM:SS - MM:SS]
• Feedbacks: máximo 2 bullet points por seção
• Tips: máximo 2 por seção

Retorne APENAS JSON válido:
{
  "overallScore": number,
  "classification": "Baixo" | "Moderado" | "Alto" | "Viral",
  "summary": "string (máx 2 frases)",
  "hookAnalysis": { "score": number, "feedback": "string", "tips": ["string"] },
  "bodyAnalysis": { "score": number, "feedback": "string", "tips": ["string"] },
  "ctaAnalysis": { "score": number, "feedback": "string", "tips": ["string"] },
  "retentionKillers": ["string (máx 3 itens)"],
  "retentionImprovements": ["string (máx 3 itens)"],
  "strengths": ["string (máx 2 itens)"],
  "weaknesses": ["string (máx 2 itens)"],
  "scriptBlueprint": {
    "captions": ["string (3 opções)"],
    "exactHook": "string",
    "bodyPacing": [{ "timestamp": "string", "action": "string" }],
    "exactCta": "string"
  },
  "viralVideoIdeas": [{ "title": "string", "description": "string (1 frase)", "hookSuggestion": "string" }]
}

Sem markdown, sem code fences. APENAS JSON válido.`;

    // Build Gemini API request parts
    const parts: any[] = [];

    if (url && (isVideoUpload || url.startsWith("http"))) {
      console.log("[Pipeline] Iniciando stream upload do vídeo para Gemini File API...");
      const { fileUri, mimeType } = await streamUploadToGemini(url, GEMINI_API_KEY);

      parts.push({ fileData: { mimeType, fileUri } });
      parts.push({
        text: isVideoUpload
          ? `Analise o potencial viral deste vídeo. Use tags temporais [MM:SS].\n\nDescrição: ${description || "Baseie-se no que você vê e ouve."}`
          : `Analise o potencial viral deste conteúdo com tags temporais.\n\nDescrição: ${description || "Nenhuma"}`,
      });
    } else {
      parts.push({
        text: `Analise o potencial viral com base na descrição: ${description}. Estime tags temporais.`,
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
    // AGENTE 2: OPENAI — Avaliação estratégica RAG (CONCISO)
    // =============================================

    const openaiSystemPrompt = `Você é o Analista Viral Sênior do Viralize AI.

Avalie a análise do Gemini usando ESTRITAMENTE estes frameworks:

---
${FRAMEWORK_ROTEIROS}
---
${DIRETRIZES_CRIATIVAS}
---

## REGRAS DE CONCISÃO (OBRIGATÓRIO)
• strengths e weaknesses: MÁXIMO 2 itens cada, 1 frase curta por item
• retentionKillers e retentionImprovements: MÁXIMO 3 itens cada
• Feedbacks de hookAnalysis/bodyAnalysis/ctaAnalysis: MÁXIMO 2 bullet points cada
• Tips: MÁXIMO 2 por seção
• summary: MÁXIMO 2 frases
• viralVideoIdeas: MÁXIMO 2 ideias, descrição de 1 frase

## OUTPUT — JSON ESTRITO (sem markdown, sem code fences)

{
  "overallScore": number (0-100),
  "classification": "Baixo" | "Moderado" | "Alto" | "Viral",
  "summary": "string (máx 2 frases)",
  "hookAnalysis": { "score": number, "feedback": "string (máx 2 bullets)", "tips": ["string (máx 2)"] },
  "bodyAnalysis": { "score": number, "feedback": "string (máx 2 bullets)", "tips": ["string (máx 2)"] },
  "ctaAnalysis": { "score": number, "feedback": "string (máx 2 bullets)", "tips": ["string (máx 2)"] },
  "retentionKillers": ["string (máx 3)"],
  "retentionImprovements": ["string (máx 3)"],
  "strengths": ["string (máx 2)"],
  "weaknesses": ["string (máx 2)"],
  "scriptBlueprint": {
    "captions": ["string (3 opções com hashtags)"],
    "exactHook": "string — frase P-C-R",
    "bodyPacing": [{ "timestamp": "string", "action": "string" }],
    "exactCta": "string"
  },
  "viralVideoIdeas": [{ "title": "string", "description": "string (1 frase)", "hookSuggestion": "string" }]
}

Use • e **negrito**. Tags [MM:SS] quando aplicável. Referencie P-C-R.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: openaiSystemPrompt },
          {
            role: "user",
            content: `Análise do Agente de Extração:\n\n${JSON.stringify(geminiAnalysis)}`,
          },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errText);
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

    console.log("[Pipeline] ✅ Pipeline multi-agente finalizado.");

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
