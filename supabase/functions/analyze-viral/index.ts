import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SYSTEM_PROMPT_BASE, FRAMEWORK_ROTEIROS, DIRETRIZES_CRIATIVAS, FRAMEWORK_RETENCAO, FRAMEWORK_PLATAFORMAS, EXEMPLOS_VIRAIS, BENCHMARKS_NICHO, FRAMEWORK_ANALISE_AUTENTICIDADE, REGRAS_DE_DECISAO_ANALISE, SCORECARD_ANALISE_VIRAL } from "../_shared/knowledge_base.ts";

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
    const { url, description, isVideoUpload, creatorProfile } = await req.json();
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

### CALIBRAÇÃO DE SCORE (OBRIGATÓRIO)
• 0-25 (Baixo): Sem estrutura viral, sem hook, sem retenção
• 26-45 (Moderado): Tem estrutura básica mas falhas graves (robotizado, cringe, sem naturalidade)
• 46-65 (Alto): Estrutura boa, algumas falhas de execução ou autenticidade
• 66-80 (Viral): Estrutura forte + execução boa + autenticidade percebida
• 81-100 (Mega Viral): Excepcional em estrutura, execução E autenticidade

### PENALIDADES OBRIGATÓRIAS
• Vídeo claramente gerado por IA (voz sintética, avatar digital, legendas mecânicas): -15 a -25 pontos
• Roteiro robotizado ou frases improváveis na fala real: -10 a -20 pontos
• Legendas quebradas ou mal sincronizadas: -5 a -15 pontos
• Falta de emoção real ou energia artificial: -10 a -20 pontos
• Mismatch entre promessa do hook e entrega do conteúdo: -10 a -15 pontos

REGRA DE OURO: Um vídeo com estrutura P-C-R perfeita MAS sem autenticidade percebida NUNCA deve passar de 55. Estrutura sem verdade = conteúdo genérico.

### AVALIAÇÃO DE AUTENTICIDADE (OBRIGATÓRIO — você é o único agente que VÊ o vídeo)
Avalie explicitamente:
• A voz é natural ou sintética/TTS?
• O rosto/avatar parece real ou gerado por IA?
• As legendas fluem naturalmente ou estão quebradas/mecânicas?
• O roteiro soa como fala humana real ou texto de IA?
• Há emoção genuína ou tudo parece artificial?
Use sua avaliação de autenticidade para ajustar os scores — NÃO inclua isso no campo "summary".

### CAMPO SUMMARY (OBRIGATÓRIO)
O summary é para o CRIADOR DE CONTEÚDO (usuário final). Escreva um resumo prático explicando o que funciona bem e o que precisa melhorar no vídeo. NUNCA mencione nomes de ferramentas, agentes de IA, Gemini, GPT ou qualquer tecnologia interna.

### ESCALA DE SCORES (OBRIGATÓRIO)
TODOS os scores (hookAnalysis.score, bodyAnalysis.score, ctaAnalysis.score, overallScore) DEVEM estar na escala 0-100. NÃO use escalas 0-5 ou 0-10.

### Regras de Análise
• Use o FRAMEWORK DE RETENÇÃO para avaliar micro-hooks, pattern interrupts e open loops
• Compare com os EXEMPLOS VIRAIS de referência — o vídeo segue padrões similares?
• Identifique o nicho e use os BENCHMARKS correspondentes para contextualizar os scores
• Avalie conformidade com as PARTICULARIDADES DA PLATAFORMA (se identificável)
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
          temperature: 0.4,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      if (geminiResponse.status === 429) {
        console.warn("[Pipeline] Gemini quota exceeded (429). Retornando código para fallback.");
        return new Response(JSON.stringify({ success: false, code: "GEMINI_QUOTA_EXCEEDED", error: "Limite de requisições Gemini excedido." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      let errorMsg = "Erro na análise de IA (Gemini)";
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
${FRAMEWORK_RETENCAO}
---
${FRAMEWORK_PLATAFORMAS}
---
${EXEMPLOS_VIRAIS}
---
${BENCHMARKS_NICHO}
---
${FRAMEWORK_ANALISE_AUTENTICIDADE}
---
${REGRAS_DE_DECISAO_ANALISE}
---
${SCORECARD_ANALISE_VIRAL}
---

## CALIBRAÇÃO DE SCORE (OBRIGATÓRIO)
• 0-25 (Baixo): Sem estrutura viral, sem hook, sem retenção
• 26-45 (Moderado): Tem estrutura básica mas falhas graves (robotizado, cringe, sem naturalidade)
• 46-65 (Alto): Estrutura boa, algumas falhas de execução ou autenticidade
• 66-80 (Viral): Estrutura forte + execução boa + autenticidade percebida
• 81-100 (Mega Viral): Excepcional em estrutura, execução E autenticidade

## PENALIDADES OBRIGATÓRIAS
• Vídeo claramente gerado por IA (voz sintética, avatar digital, legendas mecânicas): -15 a -25 pontos
• Roteiro robotizado ou frases improváveis na fala real: -10 a -20 pontos
• Legendas quebradas ou mal sincronizadas: -5 a -15 pontos
• Falta de emoção real ou energia artificial: -10 a -20 pontos
• Mismatch entre promessa do hook e entrega do conteúdo: -10 a -15 pontos

REGRA DE OURO: Um vídeo com estrutura P-C-R perfeita MAS sem autenticidade percebida NUNCA deve passar de 55. Estrutura sem verdade = conteúdo genérico.

## INSTRUÇÕES DE AVALIAÇÃO ESTRATÉGICA
• Compare o vídeo com os CASE STUDIES de referência — ele segue padrões similares de viralização?
• Use os BENCHMARKS DO NICHO para contextualizar os scores (ex: 50K views em finanças é excelente, em humor é mediano)
• Avalie retenção usando o FRAMEWORK DE RETENÇÃO: micro-hooks, pattern interrupts, open loops, visual pacing
• Avalie AUTENTICIDADE PERCEBIDA: risco de IA demais, cringe, mismatch promessa/entrega
• Use as REGRAS DE DECISÃO para fundamentar cada score — nunca julgue sem evidência
• Verifique conformidade com as PARTICULARIDADES DA PLATAFORMA se identificável
• Cite qual case study, benchmark ou regra de decisão fundamenta cada recomendação

## REGRAS DE CONCISÃO (OBRIGATÓRIO)
• strengths e weaknesses: MÁXIMO 2 itens cada, 1 frase curta por item
• retentionKillers e retentionImprovements: MÁXIMO 3 itens cada
• Feedbacks de hookAnalysis/bodyAnalysis/ctaAnalysis: MÁXIMO 2 bullet points cada
• Tips: MÁXIMO 2 por seção
• summary: MÁXIMO 2 frases — escrito para o CRIADOR DE CONTEÚDO, sem mencionar Gemini, GPT ou agentes internos
• viralVideoIdeas: MÁXIMO 2 ideias, descrição de 1 frase

## ESCALA DE SCORES (OBRIGATÓRIO)
TODOS os scores (hookAnalysis.score, bodyAnalysis.score, ctaAnalysis.score, overallScore) DEVEM estar na escala 0-100. NÃO use escalas 0-5 ou 0-10.

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

Use • e **negrito**. Tags [MM:SS] quando aplicável. Referencie P-C-R, cases e benchmarks.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        temperature: 0.5,
        max_completion_tokens: 3000,
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

    let finalAnalysis = geminiAnalysis;
    let isFallback = false;

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errText);
      console.warn("Fallback: retornando análise do Gemini sem refinamento.");
      isFallback = true;
    } else {
      const openaiData = await openaiResponse.json();
      const openaiContent = openaiData.choices?.[0]?.message?.content || "";
      try {
        finalAnalysis = JSON.parse(openaiContent);
      } catch (e) {
        console.error("Failed to parse OpenAI response:", openaiContent);
        isFallback = true;
      }
    }

    console.log(`[Pipeline] ✅ Pipeline finalizado. Fallback: ${isFallback}`);

    // =============================================
    // CACHE: Salvar análise para futuras requisições (inclui fallback)
    // =============================================
    if (url) {
      const { error: cacheErr } = await sb
        .from("analysis_cache")
        .upsert({ video_url: url, analysis: finalAnalysis }, { onConflict: "video_url" });
      if (cacheErr) console.error("[Cache] Erro ao salvar:", cacheErr.message);
      else console.log("[Cache] ✅ Análise salva no cache.");
    }

    return new Response(JSON.stringify({ success: true, analysis: finalAnalysis, ...(isFallback && { fallback: true }) }), {
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
