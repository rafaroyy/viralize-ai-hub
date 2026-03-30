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
    const { imageBase64, niche, goal, tone, audience } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: "Imagem é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // ─── Context ───
    const contextParts: string[] = [];
    if (niche) contextParts.push(`Nicho/negócio do usuário: ${niche}`);
    if (goal) contextParts.push(`Objetivo do post: ${goal}`);
    if (tone) contextParts.push(`Tom de voz desejado: ${tone}`);
    if (audience) contextParts.push(`Público-alvo: ${audience}`);
    const contextBlock = contextParts.length > 0
      ? `\n\nCONTEXTO DO USUÁRIO:\n${contextParts.join("\n")}`
      : "";

    // ─── STEP 1: Gemini — Analyze style + Generate copy ───
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

    // ─── STEP 2: Deep image analysis for layout recreation ───
    console.log("[model-post] Step 2: Deep image analysis for layout...");

    const layoutAnalysisPrompt = `Analise esta imagem de post do Instagram com EXTREMO DETALHE para que possamos recriar o layout visualmente.

Retorne JSON com EXATAMENTE esta estrutura:

{
  "layout": {
    "width": "largura estimada em px (ex: 1080)",
    "height": "altura estimada em px (ex: 1350)",
    "aspectRatio": "proporção (ex: 4:5)",
    "backgroundColor": "cor de fundo principal em hex (ex: #1a1a2e)",
    "backgroundGradient": "gradiente se houver (ex: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%))",
    "backgroundType": "solid | gradient | image | pattern"
  },
  "elements": [
    {
      "type": "text | image | shape | icon | divider",
      "content": "conteúdo do texto se for texto",
      "position": {
        "x": "posição X em % (ex: 50%)",
        "y": "posição Y em % (ex: 15%)",
        "anchor": "center | top-left | top-center | bottom-center etc"
      },
      "style": {
        "fontSize": "tamanho em px (ex: 48px)",
        "fontWeight": "bold | normal | 900 etc",
        "color": "cor em hex",
        "fontFamily": "família da fonte estimada (ex: sans-serif bold, serif italic)",
        "textAlign": "left | center | right",
        "textTransform": "uppercase | lowercase | none",
        "letterSpacing": "espaçamento se relevante",
        "lineHeight": "altura da linha",
        "maxWidth": "largura máxima do bloco de texto em %",
        "textShadow": "sombra se houver",
        "backgroundColor": "cor de fundo do elemento se houver",
        "borderRadius": "borda arredondada se houver",
        "padding": "padding se houver",
        "border": "borda se houver",
        "opacity": "opacidade se não for 1",
        "width": "largura do elemento em % se relevante",
        "height": "altura do elemento em % se relevante"
      },
      "zIndex": "ordem de camada (1 = fundo, maior = frente)"
    }
  ],
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "mood": "descrição do mood/atmosfera",
  "designStyle": "estilo de design (ex: minimalista, bold, editorial, neon)"
}

REGRAS:
- Liste TODOS os elementos visuais visíveis na imagem, na ordem de trás para frente (z-index)
- Para textos: capture o CONTEÚDO EXATO que aparece na imagem
- Para formas/shapes: descreva forma, cor, tamanho e posição
- Posições devem ser em porcentagem relativa ao canvas
- Cores SEMPRE em formato hex
- Seja EXTREMAMENTE preciso nas posições, tamanhos e cores
- Se houver imagem de fundo ou foto, descreva-a como elemento tipo "image"
- PROIBIDO incluir nomes de usuário, @ handles, perfis ou qualquer identificação do post original
- Retorne APENAS JSON válido`;

    const layoutParts: any[] = [];
    if (imageBase64.startsWith("data:")) {
      const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        layoutParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      } else {
        layoutParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64.split(",")[1] || imageBase64 } });
      }
    } else {
      layoutParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
    }
    layoutParts.push({ text: layoutAnalysisPrompt });

    const layoutResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: layoutParts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
      }),
    });

    let layoutData = null;
    if (layoutResponse.ok) {
      const layoutResult = await layoutResponse.json();
      const layoutContent = layoutResult.candidates?.[0]?.content?.parts?.[0]?.text || "";
      try {
        const cleanedLayout = layoutContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        layoutData = JSON.parse(cleanedLayout);
        console.log("[model-post] Step 2 complete. Elements found:", layoutData?.elements?.length);
      } catch (e) {
        console.error("Failed to parse layout analysis:", layoutContent);
      }
    } else {
      console.error("Layout analysis failed:", layoutResponse.status);
    }

    // ─── STEP 3: Send to webhook for HTML generation ───
    console.log("[model-post] Step 3: Sending data to webhook...");

    let postHtml: string | null = null;

    try {
      const webhookPayload = {
        copyData: {
          parteVisual: parsed.parteVisual,
          descricaoPost: parsed.descricaoPost,
          copyModelado: parsed.copyModelado,
          estiloVisual: parsed.estiloVisual,
        },
        layoutAnalysis: layoutData,
        context: {
          niche: niche || null,
          goal: goal || null,
          tone: tone || null,
          audience: audience || null,
        },
        imageBase64,
      };

      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        const contentType = webhookResponse.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const jsonResp = await webhookResponse.json();
          postHtml = jsonResp.html || jsonResp.HTML || jsonResp.content || null;
        } else {
          postHtml = await webhookResponse.text();
        }
        console.log("[model-post] Step 3 complete. HTML received:", postHtml ? `${postHtml.length} chars` : "null");
      } else {
        console.error("[model-post] Webhook error:", webhookResponse.status, await webhookResponse.text());
      }
    } catch (webhookErr) {
      console.error("[model-post] Webhook call failed:", webhookErr);
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
    console.error("model-post error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
