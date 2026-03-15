import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { source, observedAt, region, items } = body;

    if (!source || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "Payload must include: source, items[]" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Normalize n8n payload → internal format → call radar-ingest logic
    console.log(`[radar-webhook-n8n] Received ${items.length} items from n8n (source: ${source})`);

    return new Response(JSON.stringify({ ok: true, received: items.length, source }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
