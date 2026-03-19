import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  FRAMEWORK_ROTEIROS,
  FRAMEWORK_RETENCAO,
  DIRETRIZES_CRIATIVAS,
  buildCreatorRAGContext,
} from "../_shared/knowledge_base.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchYoutubeTranscript(videoId: string): Promise<{ text: string; words: Array<{ text: string; start: number; end: number }> }> {
  // Step 1: Fetch video page to extract player response
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });

  if (!pageRes.ok) throw new Error("Não foi possível acessar o vídeo do YouTube");
  const html = await pageRes.text();

  // Try multiple patterns to extract caption tracks
  let captionTracks: Array<{ baseUrl: string; languageCode: string }> | null = null;

  // Pattern 1: ytInitialPlayerResponse in script tag
  const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var|<\/script)/s);
  if (playerMatch) {
    try {
      const playerData = JSON.parse(playerMatch[1]);
      captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      console.log("Pattern 1 found captionTracks:", captionTracks?.length ?? 0);
    } catch { /* parse failed, try next */ }
  }

  // Pattern 2: look for captionTracks with greedy array match
  if (!captionTracks) {
    const captionMatch = html.match(/"captionTracks":\s*(\[[\s\S]*?\])\s*,\s*"/);
    if (captionMatch) {
      try {
        captionTracks = JSON.parse(captionMatch[1]);
        console.log("Pattern 2 found captionTracks:", captionTracks?.length ?? 0);
      } catch { /* parse failed */ }
    }
  }

  if (!captionTracks || captionTracks.length === 0) {
    // Fallback: try timedtext API directly
    console.log("No captionTracks in page HTML, trying timedtext API...");
    return await fetchTimedTextTranscript(videoId);
  }

  // Prefer Portuguese, then English, then first available
  let track = captionTracks.find(t => t.languageCode === "pt");
  if (!track) track = captionTracks.find(t => t.languageCode?.startsWith("pt"));
  if (!track) track = captionTracks.find(t => t.languageCode === "en");
  if (!track) track = captionTracks[0];

  console.log("Using caption track, language:", track.languageCode);

  const captionUrl = track.baseUrl.startsWith("http") ? track.baseUrl : `https://www.youtube.com${track.baseUrl}`;
  const captionRes = await fetch(captionUrl);
  if (!captionRes.ok) throw new Error("Erro ao baixar legendas do YouTube");

  const xml = await captionRes.text();
  return parseTranscriptXml(xml);
}

async function fetchTimedTextTranscript(videoId: string): Promise<{ text: string; words: Array<{ text: string; start: number; end: number }> }> {
  // Try YouTube's timedtext API for auto-generated and manual captions
  const attempts = [
    { lang: "pt", kind: "" },
    { lang: "pt-BR", kind: "" },
    { lang: "en", kind: "" },
    { lang: "pt", kind: "asr" },
    { lang: "en", kind: "asr" },
  ];

  for (const { lang, kind } of attempts) {
    const kindParam = kind ? `&kind=${kind}` : "";
    const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}${kindParam}&fmt=srv3`;
    console.log("Trying timedtext:", lang, kind || "manual");
    
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      
      if (res.ok) {
        const xml = await res.text();
        if (xml.trim().length > 100 && xml.includes("<")) {
          console.log("Got transcript from timedtext API, lang:", lang, kind || "manual");
          return parseTranscriptXml(xml);
        }
      }
    } catch { /* continue */ }
  }

  throw new Error("Este vídeo não possui legendas disponíveis. Por favor, faça upload do vídeo manualmente.");
}

function parseTranscriptXml(xml: string): { text: string; words: Array<{ text: string; start: number; end: number }> } {
  const words: Array<{ text: string; start: number; end: number }> = [];
  // Match <text start="X" dur="Y">content</text> or <p t="X" d="Y">content</p>
  const textPattern = /<(?:text|p)\s+[^>]*?(?:start|t)="([^"]+)"[^>]*?(?:dur|d)="([^"]+)"[^>]*>([\s\S]*?)<\/(?:text|p)>/g;
  let match;

  while ((match = textPattern.exec(xml)) !== null) {
    const start = parseFloat(match[1]) / (match[0].startsWith("<p") ? 1000 : 1); // <p> uses ms, <text> uses seconds
    const dur = parseFloat(match[2]) / (match[0].startsWith("<p") ? 1000 : 1);
    const content = match[3]
      .replace(/<[^>]+>/g, "") // strip inner tags
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, " ")
      .trim();

    if (content) {
      words.push({ text: content, start, end: start + dur });
    }
  }

  const fullText = words.map(w => w.text).join(" ");
  return { text: fullText, words };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing API keys" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const userId = formData.get("user_id") as string;
    const youtubeUrl = formData.get("youtube_url") as string | null;
    const videoFile = formData.get("video") as File | null;

    if (!userId) {
      return new Response(JSON.stringify({ error: "user_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sourceType = youtubeUrl ? "youtube" : "upload";
    const sourceUrl = youtubeUrl || null;

    // Create record
    const { data: record, error: insertErr } = await sb
      .from("viral_clips")
      .insert({
        user_id: userId,
        source_url: sourceUrl,
        source_type: sourceType,
        status: "uploading",
      })
      .select("id")
      .single();

    if (insertErr || !record) {
      throw new Error("Erro ao criar registro: " + (insertErr?.message || ""));
    }

    const recordId = record.id;

    // === SYNCHRONOUS PROCESSING ===
    let fullText = "";
    let words: Array<{ text: string; start: number; end: number }> = [];
    let storagePath: string | null = null;

    if (youtubeUrl) {
      // === YOUTUBE: Scrape captions directly ===
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) throw new Error("URL do YouTube inválida");

      await sb.from("viral_clips").update({
        status: "transcribing",
        updated_at: new Date().toISOString(),
      }).eq("id", recordId);

      try {
        const transcript = await fetchYoutubeTranscript(videoId);
        fullText = transcript.text;
        words = transcript.words;
        console.log("YouTube transcript fetched, segments:", words.length);
      } catch (e: any) {
        await sb.from("viral_clips").update({
          status: "error",
          error_message: e.message,
          updated_at: new Date().toISOString(),
        }).eq("id", recordId);
        return new Response(JSON.stringify({
          id: recordId,
          status: "error",
          error: e.message,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (videoFile) {
      // === UPLOAD: Use ElevenLabs Scribe ===
      if (!ELEVENLABS_KEY) {
        throw new Error("ELEVENLABS_KEY não configurada para transcrição de uploads");
      }

      const fileName = `viral-clips/${recordId}/${videoFile.name}`;
      const { error: uploadErr } = await sb.storage
        .from("videos")
        .upload(fileName, videoFile, { contentType: videoFile.type, upsert: true });

      if (uploadErr) throw new Error("Erro no upload: " + uploadErr.message);
      storagePath = fileName;

      await sb.from("viral_clips").update({
        video_storage_path: storagePath,
        status: "transcribing",
        updated_at: new Date().toISOString(),
      }).eq("id", recordId);

      console.log("Starting ElevenLabs transcription...");
      const transcribeForm = new FormData();
      transcribeForm.append("file", videoFile, "audio.mp4");
      transcribeForm.append("model_id", "scribe_v2");
      transcribeForm.append("tag_audio_events", "false");
      transcribeForm.append("diarize", "false");
      transcribeForm.append("language_code", "por");

      const transcribeRes = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: { "xi-api-key": ELEVENLABS_KEY },
        body: transcribeForm,
      });

      if (!transcribeRes.ok) {
        const errText = await transcribeRes.text();
        throw new Error("Erro na transcrição: " + errText);
      }

      const transcription = await transcribeRes.json();
      fullText = transcription.text || "";
      words = (transcription.words || []).map((w: any) => ({
        text: w.text,
        start: w.start,
        end: w.end,
      }));
      console.log("ElevenLabs transcription done, words:", words.length);
    } else {
      throw new Error("Nenhum vídeo fornecido");
    }

    // Save transcription
    await sb.from("viral_clips").update({
      transcription: fullText,
      status: "analyzing",
      updated_at: new Date().toISOString(),
    }).eq("id", recordId);

    // Get creator profile for context
    let creatorContext = "";
    try {
      const { data: profile } = await sb
        .from("creator_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (profile) {
        creatorContext = buildCreatorRAGContext(profile);
      }
    } catch { /* no profile */ }

    // Build word timestamps for the AI
    const wordTimestamps = words
      .slice(0, 2000)
      .map((w) => `[${(w.start * 1000).toFixed(0)}ms] ${w.text}`)
      .join(" ");

    // Analyze with Lovable AI
    console.log("Starting AI analysis...");
    const systemPrompt = `Você é um especialista em identificar momentos virais em vídeos longos.

${FRAMEWORK_ROTEIROS}

${FRAMEWORK_RETENCAO}

${DIRETRIZES_CRIATIVAS}

${creatorContext}

## Sua tarefa
Analise a transcrição do vídeo com timestamps e identifique os 3-8 melhores trechos para cortes virais curtos (30-90 segundos cada).

Para cada corte, considere:
- Potencial de retenção nos primeiros segundos
- Presença de ganchos emocionais
- Completude narrativa do trecho
- Potencial de viralização como conteúdo independente
- Alinhamento com o perfil do criador (se disponível)

IMPORTANTE: Os timestamps DEVEM estar alinhados com as palavras da transcrição. Não invente timestamps.`;

    const userPrompt = `Aqui está a transcrição com timestamps do vídeo:

${wordTimestamps || fullText}

Identifique os melhores momentos para cortes virais.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_viral_clips",
              description: "Identifica os melhores trechos virais de um vídeo longo.",
              parameters: {
                type: "object",
                properties: {
                  clips: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        start_ms: { type: "number", description: "Timestamp de início em milissegundos" },
                        end_ms: { type: "number", description: "Timestamp de fim em milissegundos" },
                        title: { type: "string", description: "Título sugerido para o corte" },
                        hook: { type: "string", description: "Hook viral sugerido para o início do corte" },
                        viral_score: { type: "number", description: "Score viral de 0 a 100" },
                        reason: { type: "string", description: "Motivo da seleção deste trecho" },
                        suggested_caption: { type: "string", description: "Legenda sugerida para o corte" },
                      },
                      required: ["start_ms", "end_ms", "title", "hook", "viral_score", "reason", "suggested_caption"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["clips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "identify_viral_clips" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) throw new Error("Rate limit atingido. Tente novamente em alguns minutos.");
      if (aiRes.status === 402) throw new Error("Créditos insuficientes. Adicione créditos ao workspace.");
      throw new Error("Erro na análise IA: " + aiRes.status);
    }

    const aiData = await aiRes.json();
    let clips: any[] = [];

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      clips = parsed.clips || [];
    }
    console.log("AI analysis done, clips found:", clips.length);

    // Save results
    await sb.from("viral_clips").update({
      clips,
      status: "done",
      updated_at: new Date().toISOString(),
    }).eq("id", recordId);

    return new Response(JSON.stringify({
      id: recordId,
      status: "done",
      clips,
      video_storage_path: storagePath,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("viral-clips error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});