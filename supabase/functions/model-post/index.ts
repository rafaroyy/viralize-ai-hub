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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // ─── Context ───
    const contextParts: string[] = [];
    if (niche) contextParts.push(`Nicho/negócio do usuário: ${niche}`);
    if (goal) contextParts.push(`Objetivo do post: ${goal}`);
    if (tone) contextParts.push(`Tom de voz desejado: ${tone}`);
    if (audience) contextParts.push(`Público-alvo: ${audience}`);
    const contextBlock = contextParts.length > 0
      ? `\n\nCONTEXTO DO USUÁRIO:\n${contextParts.join("\n")}`
      : "";

    // ─── STEP 1: Gemini 2.5 Flash — Analyze style + Generate copy ───
    const systemPrompt = `${SYSTEM_PROMPT_BASE}

## SUA TAREFA: MODELAGEM DE POST (ANÁLISE HÍBRIDA)

Você analisa imagens de posts e cria conteúdo adaptado ao contexto do usuário, aplicando os frameworks acima.
• Use a estrutura P-C-R para construir a copy (Pergunta/Hook → Conflito → Resposta/CTA)
• Inclua pelo menos um pico emocional na copy
• Alinhe o conteúdo ao ICP e nicho do usuário
• Além da copy, extraia uma descrição detalhada do ESTILO VISUAL da imagem de referência
• Sempre responda com JSON válido. Nunca inclua markdown ou code fences.`;

    const userPrompt = `Analise esta imagem de um post do Instagram e:
1. Extraia uma descrição detalhada do estilo visual (paleta de cores, mood, tipo de composição, iluminação, estilo artístico)
2. Gere um conteúdo modelado/adaptado para o contexto do usuário${contextBlock}

Retorne JSON com EXATAMENTE esta estrutura:

{
  "estiloVisual": "Descrição detalhada do estilo visual da imagem: paleta de cores (ex: tons quentes dourados, azul profundo), mood/atmosfera (ex: energético, sofisticado, acolhedor), tipo de composição (ex: minimalista com muito espaço negativo, foto centralizada com overlay), iluminação (ex: luz natural suave, neon vibrante), estilo artístico (ex: fotografia editorial, flat design, gradiente abstrato). Seja específico e descritivo para que um gerador de imagem possa recriar o ESTILO sem copiar o conteúdo.",
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
- "estiloVisual" deve descrever o estilo de forma genérica sem mencionar conteúdo específico da imagem original (sem nomes, logos, textos específicos).
- PROIBIDO incluir nomes de usuário, @ handles, perfis ou qualquer identificação do post original.
- Retorne APENAS JSON válido.`;

    // Parse base64 image
    const parts: any[] = [];
    if (imageBase64.startsWith("data:")) {
      const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      } else {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64.split(",")[1] || imageBase64 } });
      }
    } else {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
    }
    parts.push({ text: userPrompt });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    console.log("[model-post] Step 1: Calling Gemini for style analysis + copy...");
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      let errorMsg = "Falha na análise da IA";
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

    console.log("[model-post] Step 1 complete. Style:", parsed.estiloVisual?.slice(0, 100));

    // ─── STEP 2: Generate background art via Lovable AI (Gemini Image) ───
    const artPrompt = `Create a visually stunning social media post background image (1024x1024, 4:5 aspect ratio feel).

STYLE TO EMULATE (do NOT copy content, only the visual style):
${parsed.estiloVisual || "Modern, clean, professional social media design with bold colors and dynamic composition."}

CRITICAL RULES:
- DO NOT include ANY text, letters, words, numbers, watermarks, or typography in the image
- DO NOT include any faces, people, logos, or identifiable elements from the original
- Create an ORIGINAL abstract/artistic background that captures the mood and color palette described
- The image should work as a background for overlaid text
- Leave visual breathing room (especially bottom third) for text overlay
- Make it vibrant, professional, and eye-catching for social media
- Focus on: gradients, textures, geometric shapes, light effects, color transitions`;

    console.log("[model-post] Step 2: Generating background art via Lovable AI...");

    let artImageUrl: string | null = null;

    try {
      const imageGenResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            { role: "user", content: artPrompt }
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!imageGenResponse.ok) {
        const status = imageGenResponse.status;
        const errBody = await imageGenResponse.text();
        console.error(`[model-post] Image generation failed (${status}):`, errBody);

        if (status === 429) {
          console.warn("[model-post] Rate limited on image gen, returning without art");
        } else if (status === 402) {
          console.warn("[model-post] Payment required for image gen");
        }
        // Don't fail the whole request — just skip art generation
      } else {
        const imageData = await imageGenResponse.json();
        const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (generatedImage) {
          artImageUrl = generatedImage;
          console.log("[model-post] Step 2 complete. Art generated successfully.");
        } else {
          console.warn("[model-post] No image in response, skipping art generation");
        }
      }
    } catch (imgErr) {
      console.error("[model-post] Image generation error:", imgErr);
      // Non-fatal: continue without generated art
    }

    // ─── Return result ───
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          ...parsed,
          artImageUrl, // base64 data URL or null
        },
      }),
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
