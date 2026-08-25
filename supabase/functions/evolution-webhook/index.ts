// Recebe eventos da Evolution API (mensagem recebida) e agenda o fluxo ativo
// pro novo lead. Porte de jejum-bot/src/engine.js -> handleEvolutionEvent.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendMetaEvent } from "../_shared/metaCapi.ts";
import { replaceVars, sendText } from "../_shared/evolution.ts";
import { generateReply, type ChatMsg } from "../_shared/aiAgent.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const onlyDigits = (s: string | null | undefined) => (s || "").replace(/\D/g, "");

// Máximo de respostas de IA por número por hora (proteção de custo / loop).
const MAX_AI_REPLIES_PER_HOUR = 15;

type Contact = { number: string; name: string | null; status: string | null };

/** Extrai o texto da mensagem recebida (texto simples ou extendedTextMessage). */
function extractText(data: Record<string, any>): string {
  const msg = data?.message || {};
  const raw = msg.conversation ?? msg.extendedTextMessage?.text ?? "";
  return typeof raw === "string" ? raw.trim() : "";
}

/** Trata mensagens de contatos já cadastrados: opt-out ou resposta da IA. */
async function handleExistingContact(
  supabase: SupabaseClient,
  contact: Contact,
  text: string,
) {
  const number = contact.number;

  if (!text) {
    console.log("Mensagem sem texto (áudio/figurinha/etc) ignorada:", number);
    return;
  }

  // ---- Opt-out ----
  if (text.toLowerCase().replace(/\s+/g, "") === "sair") {
    await supabase.from("contacts").update({ status: "nao_comprou" }).eq("number", number);
    await supabase.from("jobs").update({ done: true }).eq("number", number).eq("done", false);
    const despedida =
      "Tudo bem, entendo. 💛 Não vou te mandar mais nada por aqui. Se um dia sentir o desejo de viver esse tempo com Deus, é só me chamar. Que Ele te guarde!";
    try {
      await sendText(number, despedida);
    } catch (e) {
      console.error("Erro ao enviar despedida:", e instanceof Error ? e.message : e);
    }
    await supabase.from("messages").insert([
      { number, role: "user", content: text },
      { number, role: "assistant", content: despedida },
    ]);
    console.log("👋 Opt-out (SAIR):", number);
    return;
  }

  // ---- Salva a mensagem recebida ----
  await supabase.from("messages").insert({ number, role: "user", content: text });

  // ---- Rate limit por hora ----
  const umaHoraAtras = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("number", number)
    .eq("role", "assistant")
    .gte("created_at", umaHoraAtras);

  if ((count ?? 0) >= MAX_AI_REPLIES_PER_HOUR) {
    console.log("⏳ Rate limit de IA atingido, ignorando:", number, count);
    return;
  }

  // ---- Histórico (últimas ~10 mensagens, ordem cronológica) ----
  const { data: rows } = await supabase
    .from("messages")
    .select("role, content")
    .eq("number", number)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(10);

  const history: ChatMsg[] = (rows || [])
    .slice()
    .reverse()
    .map((r: { role: string; content: string }) => ({
      role: r.role === "assistant" ? "assistant" : "user",
      content: r.content,
    }));

  const reply = await generateReply(history, contact);
  if (!reply) {
    console.error("IA não retornou resposta para", number);
    return;
  }

  const finalText = replaceVars(reply, contact);
  try {
    await sendText(number, finalText);
  } catch (e) {
    console.error("Erro ao enviar resposta da IA:", e instanceof Error ? e.message : e);
    return;
  }

  await supabase.from("messages").insert({ number, role: "assistant", content: finalText });
  console.log("🤖 Resposta enviada para", number, "->", finalText.slice(0, 120));
}


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
      const incomingText = extractText(data);


      const { data: existing } = await supabase
        .from("contacts")
        .select("number, name, status")
        .eq("number", number)
        .maybeSingle();

      if (existing) {
        // Contato já cadastrado: responde com o agente de IA (ou trata o opt-out).
        await handleExistingContact(supabase, existing, incomingText);
        return;
      }


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
