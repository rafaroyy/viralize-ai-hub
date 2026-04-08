import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NICHES = [
  "marketing", "negocios", "renda-extra", "financas",
  "lifestyle", "creator-economy", "tecnologia", "e-commerce",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch top trends with score > 0
    const { data: trends, error: tErr } = await supabase
      .from("trends")
      .select("id, label, category, status, niches, summary, overall_score, velocity_score, commerce_potential_score, viral_potential_score, suggested_hooks, recommended_angles, related_terms")
      .gt("overall_score", 0)
      .order("overall_score", { ascending: false })
      .limit(15);

    if (tErr) throw tErr;
    if (!trends || trends.length === 0) {
      return new Response(JSON.stringify({ ok: true, generated: 0, message: "Nenhuma trend com score > 0" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete old opportunities to regenerate fresh
    await supabase.from("trend_opportunities").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const trendSummaries = trends.map((t) =>
      `- "${t.label}" (score: ${t.overall_score}, status: ${t.status}, categoria: ${t.category}, nichos: ${(t.niches || []).join(", ") || "geral"}, velocidade: ${t.velocity_score}, potencial viral: ${t.viral_potential_score}, potencial comercial: ${t.commerce_potential_score}${t.summary ? `, resumo: ${t.summary}` : ""}${t.suggested_hooks?.length ? `, hooks existentes: ${t.suggested_hooks.slice(0, 2).join("; ")}` : ""})`
    ).join("\n");

    const prompt = `Você é um estrategista de conteúdo viral brasileiro especializado em criadores de conteúdo digital.

Analise estas trends em alta no Brasil e gere oportunidades de conteúdo para criadores. Para cada trend, crie 1-2 oportunidades direcionadas a nichos diferentes.

## TRENDS ATIVAS:
${trendSummaries}

## NICHOS DISPONÍVEIS:
${NICHES.join(", ")}

## INSTRUÇÕES:
Para cada oportunidade, forneça:
- trend_label: nome exato da trend (como listado acima)
- niche: um dos nichos disponíveis (o mais relevante)
- why_now: por que esta trend é uma oportunidade AGORA (1-2 frases, urgente e específico)
- hooks: 3 ganchos de abertura de vídeo (frases que geram curiosidade, máximo 15 palavras cada)
- video_ideas: 3 ideias concretas de vídeo (título + breve descrição do formato)
- narrative: a narrativa central do conteúdo (como contar a história, 2-3 frases)
- cta: call-to-action sugerido (curto e direto)
- suggested_product_keywords: 2-3 palavras-chave de produtos/serviços relacionados
- opportunity_score: de 0 a 100 (baseado em viralidade + comercialização + timing)

Gere entre 8 e 20 oportunidades no total, priorizando trends com maior score.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Você retorna APENAS dados estruturados via tool call." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_opportunities",
              description: "Salva as oportunidades geradas",
              parameters: {
                type: "object",
                properties: {
                  opportunities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        trend_label: { type: "string" },
                        niche: { type: "string", enum: NICHES },
                        why_now: { type: "string" },
                        hooks: { type: "array", items: { type: "string" } },
                        video_ideas: { type: "array", items: { type: "string" } },
                        narrative: { type: "string" },
                        cta: { type: "string" },
                        suggested_product_keywords: { type: "array", items: { type: "string" } },
                        opportunity_score: { type: "number" },
                      },
                      required: ["trend_label", "niche", "why_now", "hooks", "video_ideas", "narrative", "cta", "suggested_product_keywords", "opportunity_score"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["opportunities"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_opportunities" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit atingido. Tente novamente em alguns minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return tool call");

    const parsed = JSON.parse(toolCall.function.arguments);
    const opps = parsed.opportunities || [];

    // Map trend labels to IDs
    const labelToId = new Map(trends.map((t) => [t.label.toLowerCase(), t.id]));

    const rows = opps
      .map((o: any) => {
        const trendId = labelToId.get(o.trend_label?.toLowerCase());
        if (!trendId) return null;
        return {
          trend_id: trendId,
          niche: o.niche,
          why_now: o.why_now,
          hooks: o.hooks || [],
          video_ideas: o.video_ideas || [],
          narrative: o.narrative,
          cta: o.cta,
          suggested_product_keywords: o.suggested_product_keywords || [],
          opportunity_score: Math.min(100, Math.max(0, Math.round(o.opportunity_score || 0))),
        };
      })
      .filter(Boolean);

    if (rows.length > 0) {
      const { error: insertErr } = await supabase
        .from("trend_opportunities")
        .insert(rows);

      if (insertErr) {
        console.error("Insert error:", insertErr);
        throw insertErr;
      }
    }

    console.log(`[radar-generate-opportunities] Generated ${rows.length} opportunities from ${trends.length} trends`);

    return new Response(JSON.stringify({ ok: true, generated: rows.length, trendsAnalyzed: trends.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
