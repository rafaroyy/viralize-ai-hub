import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.3/cors";

const ACTOR_ID = "clockworks~free-tiktok-scraper";

interface NicheConfig {
  slug: string;
  label: string;
  hashtag: string;
}

async function runApify(apifyKey: string, input: Record<string, unknown>) {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${apifyKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Apify request failed: ${errText}`);
  }
  return await res.json();
}

function mapItems(items: any[], weekKey: string, niche: string | null) {
  // filter last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentItems = items.filter((v: any) => {
    const createTime = v.createTimeISO
      ? new Date(v.createTimeISO).getTime()
      : v.createTime
      ? v.createTime * 1000
      : 0;
    return createTime >= sevenDaysAgo;
  });

  const candidates = recentItems.length >= 5
    ? recentItems
    : items
        .filter((v: any) => v.id || v.videoId)
        .sort((a: any, b: any) => (b.createTime || 0) - (a.createTime || 0))
        .slice(0, 20);

  const sorted = candidates
    .filter((v: any) => v.id || v.videoId)
    .sort((a: any, b: any) => ((b.playCount || 0) + (b.diggCount || 0)) - ((a.playCount || 0) + (a.diggCount || 0)))
    .slice(0, 20);

  return sorted.map((v: any) => ({
    external_id: v.id || v.videoId || null,
    author_name: v.authorMeta?.name || v.author?.nickname || null,
    author_username: v.authorMeta?.nickName || v.author?.uniqueId || null,
    author_avatar: v.authorMeta?.avatar || v.author?.avatarThumb || null,
    description: v.text || v.desc || null,
    video_url: v.webVideoUrl || v.videoUrl || (v.id ? `https://www.tiktok.com/@${v.authorMeta?.nickName || "user"}/video/${v.id}` : null),
    cover_url: v.videoMeta?.coverUrl || v.covers?.default || v.video?.cover || null,
    play_count: v.playCount || 0,
    like_count: v.diggCount || v.likes || 0,
    comment_count: v.commentCount || v.comments || 0,
    share_count: v.shareCount || v.shares || 0,
    duration: v.videoMeta?.duration || v.video?.duration || 0,
    hashtags: (v.hashtags || []).map((h: any) => (typeof h === "string" ? h : h.name || h.title || "")),
    music_name: v.musicMeta?.musicName || v.music?.title || null,
    posted_at: v.createTimeISO || (v.createTime ? new Date(v.createTime * 1000).toISOString() : null),
    week_key: weekKey,
    niche,
    raw_payload: v,
  }));
}

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

    // 1. Load configs (general hashtags/queries + niches)
    const { data: configs, error: configErr } = await supabase
      .from("apify_search_config")
      .select("config_type, value")
      .eq("active", true);

    if (configErr) throw configErr;

    const generalHashtags = configs
      ?.filter((c: any) => c.config_type === "hashtag")
      .map((c: any) => c.value) ?? ["viral", "brasil"];
    const generalQueries = configs
      ?.filter((c: any) => c.config_type === "search_query")
      .map((c: any) => c.value) ?? ["viral brasil"];

    const niches: NicheConfig[] = (configs ?? [])
      .filter((c: any) => c.config_type === "niche")
      .map((c: any) => {
        try {
          return typeof c.value === "string" ? JSON.parse(c.value) : c.value;
        } catch {
          return null;
        }
      })
      .filter((n: any): n is NicheConfig => n && n.slug && n.hashtag);

    // 2. Compute week_key
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    const weekKey = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

    const summary: Record<string, number> = {};

    // 3. GENERAL fetch (niche = null)
    console.log("Fetching GENERAL viral videos:", { hashtags: generalHashtags, searchQueries: generalQueries });
    try {
      const generalItems = await runApify(apifyKey, {
        hashtags: generalHashtags,
        searchQueries: generalQueries,
        resultsPerPage: 100,
        excludePinnedPosts: true,
        shouldDownloadCovers: false,
        shouldDownloadSlideshowImages: false,
        shouldDownloadSubtitles: false,
        shouldDownloadVideos: false,
      });
      const rows = mapItems(Array.isArray(generalItems) ? generalItems : [], weekKey, null);
      await supabase
        .from("tiktok_viral_videos")
        .delete()
        .eq("week_key", weekKey)
        .is("niche", null);
      if (rows.length) {
        const { error: insErr } = await supabase.from("tiktok_viral_videos").insert(rows);
        if (insErr) throw insErr;
      }
      summary["general"] = rows.length;
      console.log(`Inserted ${rows.length} general videos`);
    } catch (err) {
      console.error("General fetch failed:", err);
      summary["general"] = 0;
    }

    // 4. NICHE fetches (1 hashtag each)
    for (const niche of niches) {
      console.log(`Fetching niche '${niche.slug}' with hashtag #${niche.hashtag}`);
      try {
        const items = await runApify(apifyKey, {
          hashtags: [niche.hashtag],
          searchQueries: [],
          resultsPerPage: 100,
          excludePinnedPosts: true,
          shouldDownloadCovers: false,
          shouldDownloadSlideshowImages: false,
          shouldDownloadSubtitles: false,
          shouldDownloadVideos: false,
        });
        const rows = mapItems(Array.isArray(items) ? items : [], weekKey, niche.slug);
        await supabase
          .from("tiktok_viral_videos")
          .delete()
          .eq("week_key", weekKey)
          .eq("niche", niche.slug);
        if (rows.length) {
          const { error: insErr } = await supabase.from("tiktok_viral_videos").insert(rows);
          if (insErr) throw insErr;
        }
        summary[niche.slug] = rows.length;
        console.log(`Inserted ${rows.length} videos for niche ${niche.slug}`);
      } catch (err) {
        console.error(`Niche ${niche.slug} fetch failed:`, err);
        summary[niche.slug] = 0;
      }
    }

    const total = Object.values(summary).reduce((a, b) => a + b, 0);

    return new Response(
      JSON.stringify({
        success: true,
        week_key: weekKey,
        count: total,
        breakdown: summary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
