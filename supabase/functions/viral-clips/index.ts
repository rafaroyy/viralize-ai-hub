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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!ELEVENLABS_KEY || !LOVABLE_API_KEY) {
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

    // Return immediately, process in background
    const responseBody = JSON.stringify({ id: recordId, status: "uploading" });

    // Background processing
    (async () => {
      try {
        let audioBlob: Blob;
        let storagePath: string | null = null;

        if (videoFile) {
          // Upload to storage
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

          // Use the video file directly for transcription
          audioBlob = videoFile;
        } else if (youtubeUrl) {
          await sb.from("viral_clips").update({
            status: "transcribing",
            updated_at: new Date().toISOString(),
          }).eq("id", recordId);

          // For YouTube, we'll pass the URL info to the AI and skip direct download
          // Instead, use a placeholder — the AI will analyze based on transcription
          // Try to fetch audio via a public proxy (cobalt)
          try {
            const cobaltRes = await fetch("https://api.cobalt.tools/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                url: youtubeUrl,
                audioFormat: "mp3",
                isAudioOnly: true,
              }),
            });

            if (cobaltRes.ok) {
              const cobaltData = await cobaltRes.json();
              if (cobaltData.url) {
                const audioRes = await fetch(cobaltData.url);
                audioBlob = await audioRes.blob();
              } else {
                throw new Error("No audio URL from cobalt");
              }
            } else {
              throw new Error("Cobalt API error");
            }
          } catch {
            // Fallback: return error asking for upload
            await sb.from("viral_clips").update({
              status: "error",
              error_message: "Não foi possível baixar o áudio do YouTube. Por favor, faça upload do vídeo manualmente.",
              updated_at: new Date().toISOString(),
            }).eq("id", recordId);
            return;
          }
        } else {
          throw new Error("Nenhum vídeo fornecido");
        }

        // Step 2: Transcribe with ElevenLabs Scribe v2
        const transcribeForm = new FormData();
        transcribeForm.append("file", audioBlob, "audio.mp4");
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
        const fullText = transcription.text || "";
        const words = transcription.words || [];

        await sb.from("viral_clips").update({
          transcription: fullText,
          status: "analyzing",
          updated_at: new Date().toISOString(),
        }).eq("id", recordId);

        // Step 3: Get creator profile for context
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
        } catch { /* no profile, continue generic */ }

        // Build word timestamps for the AI
        const wordTimestamps = words
          .slice(0, 2000) // limit to avoid token overflow
          .map((w: any) => `[${(w.start * 1000).toFixed(0)}ms] ${w.text}`)
          .join(" ");

        // Step 4: Analyze with Lovable AI
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

        // Save results
        await sb.from("viral_clips").update({
          clips,
          status: "done",
          updated_at: new Date().toISOString(),
        }).eq("id", recordId);

      } catch (err: any) {
        console.error("viral-clips processing error:", err);
        await sb.from("viral_clips").update({
          status: "error",
          error_message: err.message || "Erro no processamento",
          updated_at: new Date().toISOString(),
        }).eq("id", recordId);
      }
    })();

    return new Response(responseBody, {
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
