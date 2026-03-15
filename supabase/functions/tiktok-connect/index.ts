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
  const TIKTOK_REDIRECT_URI = Deno.env.get("TIKTOK_REDIRECT_URI");
  const isMock = !TIKTOK_CLIENT_ID;

  try {
    const body = await req.json();
    const { action, user_id } = body;

    if (action === "status") {
      return new Response(JSON.stringify({ mock: isMock }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // action === "connect"
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isMock) {
      return new Response(JSON.stringify({ mock: true, message: "Mock mode — no real redirect" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Real OAuth flow
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const state = crypto.randomUUID();
    await supabase.from("oauth_states").insert({
      user_id,
      provider: "tiktok",
      state,
      redirect_to: "/perfil",
      expires_at: new Date(Date.now() + 600000).toISOString(), // 10 min
    });

    const scopes = "user.info.basic,user.info.profile,video.list";
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_ID}&scope=${scopes}&response_type=code&redirect_uri=${encodeURIComponent(TIKTOK_REDIRECT_URI!)}&state=${state}`;

    return new Response(JSON.stringify({ auth_url: authUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
