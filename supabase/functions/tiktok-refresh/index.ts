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
  const isMock = !TIKTOK_CLIENT_ID || !TIKTOK_CLIENT_SECRET;

  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isMock) {
      return new Response(JSON.stringify({ mock: true, success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: integration } = await supabase
      .from("oauth_integrations")
      .select("refresh_token")
      .eq("user_id", user_id)
      .eq("provider", "tiktok")
      .maybeSingle();

    if (!integration?.refresh_token) {
      return new Response(JSON.stringify({ error: "No refresh token found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_ID!,
        client_secret: TIKTOK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: integration.refresh_token,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.data?.access_token) {
      return new Response(JSON.stringify({ error: tokenData.error_description || "Refresh failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const t = tokenData.data;
    await supabase
      .from("oauth_integrations")
      .update({
        access_token: t.access_token,
        refresh_token: t.refresh_token,
        expires_at: new Date(Date.now() + (t.expires_in || 86400) * 1000).toISOString(),
        status: "connected",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .eq("provider", "tiktok");

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
