import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const TIKTOK_CLIENT_ID = Deno.env.get("TIKTOK_CLIENT_ID");
  const TIKTOK_CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET");
  const TIKTOK_REDIRECT_URI = Deno.env.get("TIKTOK_REDIRECT_URI");
  const isMock = !TIKTOK_CLIENT_ID || !TIKTOK_CLIENT_SECRET;

  try {
    const { code, state } = await req.json();

    if (isMock) {
      return new Response(JSON.stringify({ mock: true, success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!code || !state) {
      return new Response(JSON.stringify({ error: "code and state are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Validate state
    const { data: stateRow, error: stateErr } = await supabase
      .from("oauth_states")
      .select("*")
      .eq("state", state)
      .eq("provider", "tiktok")
      .maybeSingle();

    if (stateErr || !stateRow) {
      return new Response(JSON.stringify({ error: "Invalid or expired state" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry
    if (new Date(stateRow.expires_at) < new Date()) {
      await supabase.from("oauth_states").delete().eq("id", stateRow.id);
      return new Response(JSON.stringify({ error: "State expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange code for token
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_ID!,
        client_secret: TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: TIKTOK_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.data?.access_token) {
      return new Response(JSON.stringify({ error: tokenData.error_description || "Token exchange failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const t = tokenData.data;
    const now = new Date().toISOString();

    // Upsert integration
    await supabase.from("oauth_integrations").upsert({
      user_id: stateRow.user_id,
      provider: "tiktok",
      provider_user_id: t.open_id,
      access_token: t.access_token,
      refresh_token: t.refresh_token,
      token_type: t.token_type || "Bearer",
      scopes: t.scope?.split(",") || [],
      expires_at: new Date(Date.now() + (t.expires_in || 86400) * 1000).toISOString(),
      connected_at: now,
      last_synced_at: now,
      status: "connected",
      raw_payload: tokenData,
    }, { onConflict: "user_id,provider" });

    // Cleanup state
    await supabase.from("oauth_states").delete().eq("id", stateRow.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
