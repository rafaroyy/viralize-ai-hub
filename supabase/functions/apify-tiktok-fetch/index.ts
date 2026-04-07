import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.3/cors";

const ACTOR_ID = "clockworks~free-tiktok-scraper";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apifyKey = Deno.env.get("APIFY_KEY");
    if (!apifyKey) {
      return new Response(JSON.stringify({ error: "APIFY_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Buscar configuração de termos/hashtags do banco
    const { data: configs, error: configErr } = await supabase
      .from("apify_search_config")
      .select("config_type, value")
      .eq("active", true);

    if (configErr) throw configErr;

    const hashtags = configs
      ?.filter((c) => c.config_type === "hashtag")
      .map((c) => c.value) ?? ["viral", "brasil"];
    const searchQueries = configs
      ?.filter((c) => c.config_type === "search_query")
      .map((c) => c.value) ?? ["viral brasil"];

    // 2. Chamar o Apify Actor via API
    const actorInput = {
      hashtags,
      searchQueries,
      resultsPerPage: 20,
      excludePinnedPosts: false,
      shouldDownloadCovers: false,
      shouldDownloadSlideshowImages: false,
      shouldDownloadSubtitles: false,
      shouldDownloadVideos: false,
    };

    console.log("Calling Apify actor with input:", JSON.stringify(actorInput));

    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${apifyKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actorInput),
      }
    );

    if (!runRes.ok) {
      const errText = await runRes.text();
      console.error("Apify error:", errText);
      return new Response(
        JSON.stringify({ error: "Apify request failed", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const items = await runRes.json();
    console.log(`Apify returned ${items.length} items`);

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ message: "No items returned from Apify", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Gerar week_key (ex: "2026-W15")
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    const weekKey = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

    // 4. Ordenar por engajamento e pegar top 20
    const sorted = items
      .filter((v: any) => v.id || v.videoId)
      .sort((a: any, b: any) => ((b.playCount || 0) + (b.diggCount || 0)) - ((a.playCount || 0) + (a.diggCount || 0)))
      .slice(0, 20);

    // 5. Mapear e inserir no banco
    const rows = sorted.map((v: any) => ({
      external_id: v.id || v.videoId || null,
      author_name: v.authorMeta?.name || v.author?.nickname || null,
      author_username: v.authorMeta?.nickName || v.author?.uniqueId || null,
      author_avatar: v.authorMeta?.avatar || v.author?.avatarThumb || null,
      description: v.text || v.desc || null,
      video_url: v.webVideoUrl || v.videoUrl || (v.id ? `https://www.tiktok.com/@${v.authorMeta?.nickName || "user"}/video/${v.id}` : null),
      cover_url: v.covers?.default || v.video?.cover || null,
      play_count: v.playCount || 0,
      like_count: v.diggCount || v.likes || 0,
      comment_count: v.commentCount || v.comments || 0,
      share_count: v.shareCount || v.shares || 0,
      duration: v.videoMeta?.duration || v.video?.duration || 0,
      hashtags: (v.hashtags || []).map((h: any) => (typeof h === "string" ? h : h.name || h.title || "")),
      music_name: v.musicMeta?.musicName || v.music?.title || null,
      posted_at: v.createTimeISO || (v.createTime ? new Date(v.createTime * 1000).toISOString() : null),
      week_key: weekKey,
      raw_payload: v,
    }));

    // Deletar dados anteriores desta semana para evitar duplicatas
    await supabase.from("tiktok_viral_videos").delete().eq("week_key", weekKey);

    const { error: insertErr } = await supabase
      .from("tiktok_viral_videos")
      .insert(rows);

    if (insertErr) throw insertErr;

    console.log(`Inserted ${rows.length} TikTok viral videos for ${weekKey}`);

    return new Response(
      JSON.stringify({ success: true, count: rows.length, week_key: weekKey }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
