import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SYSTEM_PROMPT_BASE } from "../_shared/knowledge_base.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WEBHOOK_URL = "https://n8n.growyia.com/webhook/postpost";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, niche, goal, tone, audience, format, colors, style, additionalInfo } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ success: false, error: "O tema/assunto do post é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // ─── Context ───
    const contextParts: string[] = [];
    contextParts.push(`Tema/assunto do post: ${topic}`);
    if (niche) contextParts.push(`Nicho/negócio do usuário: ${niche}`);
    if (goal) contextParts.push(`Objetivo do post: ${goal}`);
    if (tone) contextParts.push(`Tom de voz desejado: ${tone}`);
    if (audience) contextParts.push(`Público-alvo: ${audience}`);
    if (format) contextParts.push(`Formato desejado: ${format}`);
    if (colors) contextParts.push(`Cores desejadas: ${colors}`);
    if (style) contextParts.push(`Estilo visual desejado: ${style}`);
    if (additionalInfo) contextParts.push(`Informações adicionais: ${additionalInfo}`);
    const contextBlock = `\n\nCONTEXTO DO USUÁRIO:\n${contextParts.join("\n")}`;

    // ─── STEP 1: Gemini — Generate copy + visual direction ───
    const systemPrompt = `${SYSTEM_PROMPT_BASE}

## SUA TAREFA: CRIAÇÃO DE POST DO ZERO

Você cria conteúdo completo para posts de Instagram a partir do zero, aplicando os frameworks acima.
• Use a estrutura P-C-R para construir a copy (Pergunta/Hook → Conflito → Resposta/CTA)
• Inclua pelo menos um pico emocional na copy
• Alinhe o conteúdo ao ICP e nicho do usuário
• Crie uma direção visual completa para o post
• Sempre responda com JSON válido. Nunca inclua markdown ou code fences.`;

    const userPrompt = `Crie um post completo para Instagram sobre o tema fornecido pelo usuário.${contextBlock}

Retorne JSON com EXATAMENTE esta estrutura:

{
  "estiloVisual": "Descrição detalhada do estilo visual que o post deve ter: paleta de cores (ex: tons quentes dourados, azul profundo), mood/atmosfera (ex: energético, sofisticado, acolhedor), tipo de composição (ex: minimalista com muito espaço negativo, foto centralizada com overlay), iluminação (ex: luz natural suave, neon vibrante), estilo artístico (ex: fotografia editorial, flat design, gradiente abstrato). Seja específico e descritivo para que um gerador de imagem possa criar o estilo.",
  "parteVisual": "A frase ou título impactante do INÍCIO da copy que será usada como texto principal sobreposto na arte. Deve ser curta (1-3 linhas), chamativa e funcionar sozinha como headline visual.",
  "descricaoPost": "O RESTANTE da copy: corpo do texto, call-to-action, hashtags. Inclua hashtags relevantes no final.",
  "copyModelado": "Texto COMPLETO da copy (parteVisual + descricaoPost juntos). Copy pronta para uso com emojis, hashtags, quebras de linha e call-to-action. Mínimo 3 parágrafos.",
  "gatilhosUtilizados": [
    {
      "nome": "Nome do gatilho mental",
      "explicacao": "Explicação de como e onde esse gatilho foi aplicado"
    }
  ]
}

REGRAS:
- A copy DEVE ser adaptada ao nicho, tom e público-alvo fornecidos.
- "parteVisual" deve conter APENAS o título/headline impactante. Texto curto e direto.
- "descricaoPost" deve conter todo o restante: corpo, CTA, hashtags.
- Inclua pelo menos 3 gatilhos mentais relevantes.
- PROIBIDO incluir nomes de usuário, @ handles, perfis ou qualquer identificação.
- Se o usuário especificou cores ou estilo, PRIORIZE essas preferências no estiloVisual.
- Retorne APENAS JSON válido.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    console.log("[create-post] Step 1: Calling Gemini for copy generation...");
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      let errorMsg = "Falha na geração da IA";
      if (geminiResponse.status === 429) errorMsg = "Limite de requisições excedido. Tente novamente em alguns instantes.";
      if (geminiResponse.status === 403) errorMsg = "Chave de API inválida ou sem permissão.";
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await geminiResponse.json();
    const content = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini response:", content);
      return new Response(
        JSON.stringify({ success: false, error: "Falha ao interpretar resposta da IA", raw: content }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-post] Step 1 complete. Headline:", parsed.parteVisual?.slice(0, 60));

    // ─── STEP 2: Send to webhook ───
    console.log("[create-post] Step 2: Sending data to webhook...");

    let postHtml: string | null = null;

    try {
      const webhookPayload = {
        mode: "create",
        copyData: {
          parteVisual: parsed.parteVisual,
          descricaoPost: parsed.descricaoPost,
          copyModelado: parsed.copyModelado,
          estiloVisual: parsed.estiloVisual,
          gatilhosUtilizados: parsed.gatilhosUtilizados,
        },
        context: {
          topic: topic || null,
          niche: niche || null,
          goal: goal || null,
          tone: tone || null,
          audience: audience || null,
          format: format || null,
          colors: colors || null,
          style: style || null,
          additionalInfo: additionalInfo || null,
        },
      };

      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        const contentType = webhookResponse.headers.get("content-type") || "";
        let rawBody: string;
        if (contentType.includes("application/json")) {
          const jsonResp = await webhookResponse.json();
          rawBody = jsonResp.html || jsonResp.HTML || jsonResp.content || jsonResp.output || "";
          if (typeof rawBody !== "string") rawBody = JSON.stringify(rawBody);
        } else {
          rawBody = await webhookResponse.text();
        }
        // Strip markdown code fences if present
        postHtml = rawBody
          .replace(/^```html\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```\s*$/i, "")
          .trim() || null;
        console.log("[create-post] Step 2 complete. HTML received:", postHtml ? `${postHtml.length} chars` : "null");
      } else {
        console.error("[create-post] Webhook error:", webhookResponse.status, await webhookResponse.text());
      }
    } catch (webhookErr) {
      console.error("[create-post] Webhook call failed:", webhookErr);
    }

    // ─── Return result ───
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          ...parsed,
          postHtml,
          artImageUrl: null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-post error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
