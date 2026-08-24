// Recebe eventos da Evolution API (mensagem recebida) e agenda o fluxo ativo
// pro novo lead. Porte de jejum-bot/src/engine.js -> handleEvolutionEvent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendMetaEvent } from "../_shared/metaCapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const onlyDigits = (s: string | null | undefined) => (s || "").replace(/\D/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Responde 200 imediatamente (mesmo padrão do server.js original) e processa em background.
  const body = await req.json().catch(() => ({}));

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const process = async () => {
    try {
      const event = String(body.event || body.type || "").toLowerCase().replace(/_/g, ".");
      if (event !== "messages.upsert") return;

      const data = body.data || {};
      const key = data.key || {};
      if (key.fromMe) return;
      const jid = String(key.remoteJid || "");
      if (jid.endsWith("@g.us")) return;

      const number = onlyDigits(jid);
      if (!number) return;
      const name = data.pushName || null;

      const { data: existing } = await supabase.from("contacts").select("number").eq("number", number).maybeSingle();
      if (existing) return; // já está no fluxo — não reinicia

      const { data: flow } = await supabase.from("flows").select("*").eq("active", true).limit(1).maybeSingle();
      if (!flow || !Array.isArray(flow.steps) || flow.steps.length === 0) {
        console.log("Sem fluxo ativo — lead ignorado:", number);
        return;
      }

      await supabase.from("contacts").insert({ number, name, status: "lead", flow_id: flow.id });

      const now = Date.now();
      const jobs = flow.steps.map((stage: { delayMin?: number }, i: number) => ({
        number,
        flow_id: flow.id,
        stage: i,
        run_at: new Date(now + (Number(stage.delayMin) || 0) * 60000).toISOString(),
        done: false,
      }));
      if (jobs.length) await supabase.from("jobs").insert(jobs);

      console.log("➕ Novo lead:", number, name || "", "→ fluxo", flow.id);

      // Avisa a Meta que essa lead veio do anúncio e chegou no WhatsApp.
      await sendMetaEvent({ eventName: "Contact", phone: number, eventId: `contact-${number}` });
    } catch (e) {
      console.error("Erro no evolution-webhook:", e instanceof Error ? e.message : e);
    }
  };

  // @ts-ignore - EdgeRuntime está disponível no runtime das Edge Functions
  if (typeof EdgeRuntime !== "undefined") {
    // @ts-ignore
    EdgeRuntime.waitUntil(process());
  } else {
    await process();
  }

  return new Response("OK", { status: 200, headers: corsHeaders });
});
