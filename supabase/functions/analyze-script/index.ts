import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um especialista em análise de roteiros virais. Sua função é analisar roteiros usando a metodologia P–C–R (Pergunta, Conflito, Resposta).

## Conhecimento base sobre roteiros virais:

Roteiro é a linha de raciocínio do vídeo, a ordem estratégica das ideias, o controle da atenção e emoção de quem assiste.

### O único objetivo de um roteiro
Roteiro bom é roteiro que gera retenção. Se a pessoa sai do vídeo antes do final, o roteiro falhou.

### Emoção é obrigatória
Conteúdo sem emoção não retém. O roteiro precisa gerar pelo menos um pico emocional: Curiosidade, Choque, Identificação, Revolta, Esperança, Desejo. Vídeo neutro, morno ou "bonitinho" não viraliza.

### Estrutura P–C–R:

**P – Pergunta (Gancho)**
Comece o vídeo levantando uma dúvida clara, para que a pessoa se obrigue a ficar até o final.
Exemplos: "E foi isso que acabou com a carreira desse jogador de futebol", "É por esse motivo que o seu perfil no instagram não cresce"
Ou usando gancho visual que gere curiosidade.

**C – Conflito (Tensão)**
Aprofunde a dor, o erro ou a crença errada. Mostre o que todo mundo faz errado, vá contra o senso comum, crie tensão. A pessoa deve pensar: "Ok… isso faz sentido. Quero saber o final."

**R – Resposta (Entrega)**
Entregue a resposta somente no final. Deve ser clara, direta e aplicável. Finalize com CTA: "Segue o perfil pra parte 2", "Comenta se faz sentido", "Salva esse vídeo".

### Regras importantes:
- POLÊMICAS/MEMES/QUALQUER INFORMAÇÃO QUE CHAME ATENÇÃO E RETENHA O USUÁRIO DEVE FICAR NO COMEÇO DO VÍDEO
- Os primeiros 3 segundos são decisivos — ganchos fortes (curiosidade, polêmica, promessa)
- Usar legendas/subtítulos aumenta retenção em até 40%
- Vídeos entre 15-30 segundos têm a melhor taxa de conclusão
- Consistência: postar 1-3 vídeos por dia aumenta chances de viralizar

## Formato de resposta OBRIGATÓRIO (JSON):
Responda APENAS com um JSON válido, sem markdown, sem texto antes ou depois. O JSON deve ter exatamente esta estrutura:

{
  "overallScore": <número 0-100>,
  "retentionScore": <número 0-100>,
  "emotionalPeak": "<string descrevendo o pico emocional principal>",
  "pergunta": {
    "score": <número 0-100>,
    "label": "Pergunta (Gancho)",
    "feedback": "<feedback detalhado sobre o gancho>"
  },
  "conflito": {
    "score": <número 0-100>,
    "label": "Conflito (Tensão)",
    "feedback": "<feedback detalhado sobre o conflito>"
  },
  "resposta": {
    "score": <número 0-100>,
    "label": "Resposta (Entrega)",
    "feedback": "<feedback detalhado sobre a entrega e CTA>"
  },
  "insights": [
    { "type": "positive", "text": "<insight positivo>" },
    { "type": "positive", "text": "<insight positivo>" },
    { "type": "warning", "text": "<ponto de melhoria>" },
    { "type": "warning", "text": "<ponto de melhoria>" },
    { "type": "warning", "text": "<ponto de melhoria>" }
  ],
  "ctaFeedback": "<feedback específico sobre o CTA do roteiro>"
}

Forneça entre 3 e 6 insights, misturando positivos e warnings. Seja específico, prático e direto nos feedbacks. Use exemplos concretos de como melhorar quando der warnings.`;

async function transcribeAudio(audioBlob: Blob, apiKey: string, projectKey?: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "video.mp4");
  formData.append("model", "whisper-1");
  formData.append("language", "pt");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };
  if (projectKey) {
    headers["OpenAI-Project"] = projectKey;
  }

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Whisper API error:", response.status, errorText);
    throw new Error("Erro ao transcrever vídeo.");
  }

  const data = await response.json();
  return data.text;
}

async function analyzeScript(script: string, apiKey: string, projectKey?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (projectKey) {
    headers["OpenAI-Project"] = projectKey;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analise o seguinte roteiro de vídeo viral:\n\n${script}` },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", response.status, errorText);
    throw new Error("Erro ao analisar roteiro. Tente novamente.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const projectKey = Deno.env.get("OPENAI_PROJECT_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    const contentType = req.headers.get("content-type") || "";
    let script: string;

    if (contentType.includes("multipart/form-data")) {
      // Video upload flow: transcribe first, then analyze
      const formData = await req.formData();
      const videoFile = formData.get("video") as File | null;

      if (!videoFile) {
        return new Response(
          JSON.stringify({ error: "Nenhum vídeo enviado." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Transcribing video:", videoFile.name, "size:", videoFile.size);
      script = await transcribeAudio(videoFile, apiKey, projectKey);
      console.log("Transcription result:", script.substring(0, 200));

      if (!script || script.trim().length < 10) {
        return new Response(
          JSON.stringify({ error: "Não foi possível identificar fala no vídeo. Tente um vídeo com áudio mais claro." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Text script flow
      const body = await req.json();
      script = body.script;

      if (!script || typeof script !== "string" || script.trim().length < 10) {
        return new Response(
          JSON.stringify({ error: "Roteiro muito curto para análise. Escreva pelo menos algumas frases." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const analysis = await analyzeScript(script, apiKey, projectKey);

    // Include the transcription in the response for video uploads
    if (contentType.includes("multipart/form-data")) {
      analysis.transcription = script;
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
