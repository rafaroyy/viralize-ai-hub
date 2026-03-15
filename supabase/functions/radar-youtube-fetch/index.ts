import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function calcScores(video: any) {
  const viewCount = Number(video.statistics?.viewCount || 0);
  const likeCount = Number(video.statistics?.likeCount || 0);
  const commentCount = Number(video.statistics?.commentCount || 0);
  const publishedAt = new Date(video.snippet?.publishedAt || Date.now());
  const hoursAgo = (Date.now() - publishedAt.getTime()) / 3600000;

  // Velocity: newer + more views = higher
  const velocityRaw = hoursAgo > 0 ? viewCount / hoursAgo : viewCount;
  const velocityScore = Math.min(100, Math.round(Math.log10(Math.max(1, velocityRaw)) * 15));

  // Novelty: newer = higher
  const noveltyScore = Math.min(100, Math.max(0, Math.round(100 - hoursAgo * 0.5)));

  // Viral potential: engagement ratio
  const engagement = viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;
  const viralPotentialScore = Math.min(100, Math.round(engagement * 10 + Math.log10(Math.max(1, viewCount)) * 5));

  // Commerce potential: based on category and engagement
  const commercePotentialScore = Math.min(100, Math.round(Math.log10(Math.max(1, viewCount)) * 8 + engagement * 5));

  // Risk: saturation proxy
  const riskScore = Math.min(100, Math.round(Math.log10(Math.max(1, viewCount)) * 3));

  // Saturation
  const saturationScore = Math.min(100, Math.round(Math.max(0, hoursAgo > 48 ? 60 : hoursAgo)));

  // Cross-source (only YouTube for now)
  const crossSourceScore = 25;

  // Overall
  const overallScore = Math.min(
    100,
    Math.round(
      velocityScore * 0.25 +
        viralPotentialScore * 0.25 +
        noveltyScore * 0.2 +
        commercePotentialScore * 0.15 +
        crossSourceScore * 0.15
    )
  );

  // Raw score for trend_sources (normalized view count)
  const rawScore = Math.min(100, Math.round(Math.log10(Math.max(1, viewCount)) * 10));

  return {
    velocityScore,
    noveltyScore,
    viralPotentialScore,
    commercePotentialScore,
    riskScore,
    saturationScore,
    crossSourceScore,
    overallScore,
    rawScore,
  };
}

function mapStatus(hoursAgo: number, viewCount: number): string {
  if (hoursAgo < 6) return "nova";
  if (hoursAgo < 24 && viewCount > 100000) return "subindo";
  if (viewCount > 1000000) return "pico";
  if (hoursAgo > 72) return "caindo";
  return "subindo";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseServiceKey);

    // Create fetch run
    const { data: run } = await sb
      .from("trend_fetch_runs")
      .insert({ source: "youtube", status: "running" })
      .select("id")
      .single();

    const runId = run?.id;

    // Fetch YouTube trending videos (Brazil)
    const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=BR&maxResults=50&key=${YOUTUBE_API_KEY}`;
    const ytRes = await fetch(ytUrl);

    if (!ytRes.ok) {
      const errBody = await ytRes.text();
      console.error("[radar-youtube-fetch] YouTube API error:", errBody);
      if (runId) {
        await sb
          .from("trend_fetch_runs")
          .update({ status: "error", error_message: errBody, finished_at: new Date().toISOString() })
          .eq("id", runId);
      }
      throw new Error(`YouTube API returned ${ytRes.status}`);
    }

    const ytData = await ytRes.json();
    const videos = ytData.items || [];
    let processed = 0;

    for (const video of videos) {
      const videoId = video.id;
      const title = video.snippet?.title || "Sem título";
      const channelTitle = video.snippet?.channelTitle || "";
      const publishedAt = video.snippet?.publishedAt || new Date().toISOString();
      const categoryId = video.snippet?.categoryId || "";
      const tags = video.snippet?.tags || [];
      const thumbnail = video.snippet?.thumbnails?.high?.url || "";
      const viewCount = Number(video.statistics?.viewCount || 0);
      const hoursAgo = (Date.now() - new Date(publishedAt).getTime()) / 3600000;

      const scores = calcScores(video);
      const status = mapStatus(hoursAgo, viewCount);

      // Upsert trend
      const { data: trend, error: trendErr } = await sb
        .from("trends")
        .upsert(
          {
            external_id: videoId,
            label: title,
            category: "assunto",
            country: "BR",
            region: "BR",
            status,
            velocity_score: scores.velocityScore,
            cross_source_score: scores.crossSourceScore,
            novelty_score: scores.noveltyScore,
            saturation_score: scores.saturationScore,
            risk_score: scores.riskScore,
            viral_potential_score: scores.viralPotentialScore,
            commerce_potential_score: scores.commercePotentialScore,
            overall_score: scores.overallScore,
            aliases: tags.slice(0, 5),
            niches: [],
            related_terms: tags.slice(0, 10),
            suggested_hooks: [],
            suggested_formats: ["react", "comentário", "lista"],
            suggested_ctas: [],
            recommended_angles: [],
            summary: `Vídeo trending do YouTube por ${channelTitle}. ${viewCount.toLocaleString("pt-BR")} views.`,
            first_seen_at: publishedAt,
            last_seen_at: new Date().toISOString(),
            raw_payload: { videoId, channelTitle, categoryId, thumbnail },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "external_id" }
        )
        .select("id")
        .single();

      if (trendErr) {
        console.error(`[radar-youtube-fetch] Upsert trend error for ${videoId}:`, trendErr);
        continue;
      }

      const trendId = trend!.id;

      // Insert trend_source
      await sb.from("trend_sources").upsert(
        {
          trend_id: trendId,
          source: "youtube",
          source_type: "trending",
          signal_label: title,
          region: "BR",
          url: `https://youtube.com/watch?v=${videoId}`,
          raw_score: scores.rawScore,
          normalized_score: scores.overallScore,
          observed_at: new Date().toISOString(),
          external_id: videoId,
          raw_payload: video.statistics,
        },
        { onConflict: "external_id" }
      );

      processed++;
    }

    // Update fetch run
    if (runId) {
      await sb
        .from("trend_fetch_runs")
        .update({
          status: "success",
          items_count: processed,
          finished_at: new Date().toISOString(),
        })
        .eq("id", runId);
    }

    console.log(`[radar-youtube-fetch] Processed ${processed} trending videos from YouTube BR`);

    return new Response(
      JSON.stringify({ ok: true, processed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[radar-youtube-fetch] Error:", e.message);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
