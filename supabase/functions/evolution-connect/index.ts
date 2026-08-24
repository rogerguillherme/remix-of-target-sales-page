// Proxy autenticado pra Evolution API: gera o QR Code de conexão do WhatsApp
// e configura o webhook. A EVOLUTION_KEY nunca é exposta ao navegador.
// Requer login (Supabase Auth) + estar na tabela jejum_admins.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { connectInstance, setWebhook } from "../_shared/evolution.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "nao_autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    const email = userData?.user?.email;
    if (userErr || !email) {
      return new Response(JSON.stringify({ error: "nao_autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: admin } = await supabase.from("jejum_admins").select("email").eq("email", email).maybeSingle();
    if (!admin) {
      return new Response(JSON.stringify({ error: "nao_autorizado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    let setupUrl = url.searchParams.get("setup_webhook_url");
    if (!setupUrl && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      setupUrl = body?.setupWebhookUrl || null;
    }

    if (setupUrl) {
      const data = await setWebhook(setupUrl);
      return new Response(JSON.stringify({ ok: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await connectInstance();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
