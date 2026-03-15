import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { source, region, items } = body;

    if (!source || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "Missing required fields: source, items[]" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Save to trend_sources + upsert trends + create snapshots
    console.log(`[radar-ingest] Received ${items.length} items from ${source} (${region || "BR"})`);

    return new Response(JSON.stringify({ ok: true, received: items.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
