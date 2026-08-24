// Ferramenta de operação: matricula um número manualmente no fluxo ativo e
// dispara a etapa 0 agora mesmo — usada pra testar a conexão Evolution + fluxo
// de ponta a ponta. Protegida por um secret (reaproveita EVOLUTION_KEY) — só
// quem já tem a chave da Evolution consegue chamar.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendMessages } from "../_shared/evolution.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const onlyDigits = (s: string | null | undefined) => (s || "").replace(/\D/g, "");
function normalize(n: string) {
  const d = onlyDigits(n);
  if (d.startsWith("55") && d.length >= 12) return d;
  return "55" + d;
}

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

    const number = normalize(body?.number || "");
    if (!number) {
      return new Response(JSON.stringify({ error: "numero_invalido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: flow } = await supabase.from("flows").select("*").eq("active", true).limit(1).maybeSingle();
    if (!flow || !Array.isArray(flow.steps) || !flow.steps.length) {
      return new Response(JSON.stringify({ error: "sem_fluxo_ativo" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let { data: contact } = await supabase.from("contacts").select("*").eq("number", number).maybeSingle();
    if (!contact) {
      await supabase.from("contacts").insert({ number, status: "lead", flow_id: flow.id });
      const { data: c } = await supabase.from("contacts").select("*").eq("number", number).maybeSingle();
      contact = c;
    }

    const now = Date.now();
    const { data: existingJobs } = await supabase.from("jobs").select("stage").eq("number", number);
    const doneStages = new Set((existingJobs || []).map((j: { stage: number }) => j.stage));
    const jobsToInsert = (flow.steps as Array<{ delayMin?: number }>)
      .map((stage, i: number) => ({
        number,
        flow_id: flow.id,
        stage: i,
        run_at: new Date(now + (Number(stage.delayMin) || 0) * 60000).toISOString(),
        done: i === 0, // etapa 0 é enviada agora mesmo, abaixo — as demais ficam agendadas
      }))
      .filter((j) => !doneStages.has(j.stage));
    if (jobsToInsert.length) await supabase.from("jobs").insert(jobsToInsert);

    const stage0 = flow.steps[0] as { type: string; messages?: unknown[] };
    let sent = false;
    if (stage0?.type === "send") {
      await sendMessages(number, stage0.messages as never, contact);
      sent = true;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        number,
        flow: flow.name,
        stage0_sent: sent,
        remaining_stages_scheduled: flow.steps.length - 1,
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
