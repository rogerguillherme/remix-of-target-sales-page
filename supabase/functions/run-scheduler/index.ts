// Agendador: chamado periodicamente (Cron Job) para disparar as mensagens
// cujo horário chegou. Porte de jejum-bot/src/engine.js -> runDueJobs.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendMessages } from "../_shared/evolution.ts";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

Deno.serve(async (req) => {
  const authError = authenticateCronRequest(req);
  if (authError) return authError;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let processed = 0;
  try {
    const nowIso = new Date().toISOString();
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("done", false)
      .lte("run_at", nowIso)
      .order("run_at", { ascending: true })
      .limit(25);

    if (error) throw error;

    for (const job of jobs || []) {
      await supabase.from("jobs").update({ done: true }).eq("id", job.id);

      const { data: contact } = await supabase.from("contacts").select("*").eq("number", job.number).maybeSingle();
      if (!contact || contact.status === "comprou") continue;

      const { data: flow } = await supabase.from("flows").select("*").eq("id", job.flow_id).maybeSingle();
      const steps = (flow?.steps || []) as Array<Record<string, unknown>>;
      const stage = steps[job.stage];
      if (!stage) continue;

      if (stage.type === "action" && stage.action === "mark_nao_comprou") {
        await supabase.from("contacts").update({ status: "nao_comprou" }).eq("number", job.number);
        if (flow?.no_sale_messages?.length) {
          await sendMessages(job.number, flow.no_sale_messages as never, contact);
        }
      } else {
        await sendMessages(job.number, stage.messages as never, contact);
      }
      processed++;
    }
  } catch (e) {
    console.error("Erro no run-scheduler:", e instanceof Error ? e.message : e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, processed }), {
    headers: { "Content-Type": "application/json" },
  });
});
