// Ferramenta de diagnóstico: lista as instâncias reais cadastradas na Evolution
// API configurada (EVOLUTION_URL/EVOLUTION_KEY), sem expor a chave. Usada só
// pra descobrir o instanceName correto quando EVOLUTION_INSTANCE está errado.
// Protegida pelo mesmo secret usado em manual-send-flow.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const SECRET = Deno.env.get("EVOLUTION_KEY") || "";
    if (!SECRET || body?.secret !== SECRET) {
      return new Response(JSON.stringify({ error: "nao_autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const EVOLUTION_URL = (Deno.env.get("EVOLUTION_URL") || "").replace(/\/$/, "");
    const CONFIGURED_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "";

    const res = await fetch(EVOLUTION_URL + "/instance/fetchInstances", {
      headers: { apikey: SECRET },
    });
    const text = await res.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
      // mantém texto cru
    }

    return new Response(
      JSON.stringify({
        evolution_url: EVOLUTION_URL,
        configured_instance_secret: CONFIGURED_INSTANCE,
        evolution_status: res.status,
        instances: data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
