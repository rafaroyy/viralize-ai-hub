import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getWeekKey(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000);
  const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const weekKey = getWeekKey();

    // Check cache
    const { data: cached } = await supabase
      .from("weekly_digest")
      .select("content")
      .eq("week_key", weekKey)
      .maybeSingle();

    if (cached?.content) {
      return new Response(JSON.stringify(cached.content), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate with Gemini 2.5 Pro
    const today = new Date().toISOString().split("T")[0];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `Você é um analista de tendências virais do Brasil especializado em conteúdo digital. 
Sua função é gerar um resumo semanal das principais novidades virais da semana para criadores de conteúdo brasileiros.
Responda APENAS com JSON válido, sem markdown ou texto extra.`,
          },
          {
            role: "user",
            content: `Hoje é ${today}. Gere o digest semanal (semana ${weekKey}) das novidades virais no Brasil.

Retorne um JSON com esta estrutura exata:
{
  "week": "${weekKey}",
  "sections": [
    {
      "title": "🔥 Memes que Viralizaram",
      "items": [
        { "title": "Nome do meme", "description": "Breve descrição de por que viralizou e como usar", "platform": "tiktok" }
      ]
    },
    {
      "title": "🎵 Músicas em Alta",
      "items": [
        { "title": "Nome da música - Artista", "description": "Como está sendo usada em vídeos virais", "platform": "tiktok" }
      ]
    },
    {
      "title": "📈 Trends da Semana",
      "items": [
        { "title": "Nome da trend", "description": "O que é e como participar", "platform": "instagram" }
      ]
    },
    {
      "title": "💡 Oportunidades de Conteúdo",
      "items": [
        { "title": "Oportunidade", "description": "Por que agora é o momento ideal para criar sobre isso", "platform": "youtube" }
      ]
    }
  ]
}

Regras:
- 3-5 itens por seção
- Foque em tendências REAIS e atuais do Brasil
- Plataformas: tiktok, instagram, youtube, twitter, kwai
- Descrições curtas (máx 2 frases), práticas e orientadas a ação para criadores
- Priorize tendências com potencial comercial e de engajamento`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Empty AI response");
    }

    // Parse JSON from response (handle markdown code blocks)
    let content;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      content = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      throw new Error("Invalid AI response format");
    }

    // Cache in database
    await supabase.from("weekly_digest").upsert(
      { week_key: weekKey, content },
      { onConflict: "week_key" }
    );

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("weekly-digest error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
