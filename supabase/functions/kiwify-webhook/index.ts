// Recebe a confirmação de compra da Kiwify: marca o contato como "comprou",
// cancela os jobs pendentes e dispara as purchaseMessages do fluxo.
// Porte de jejum-bot/src/engine.js -> handleKiwify.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendMessages } from "../_shared/evolution.ts";
import { sendMetaEvent } from "../_shared/metaCapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const onlyDigits = (s: string | null | undefined) => (s || "").replace(/\D/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const body = await req.json().catch(() => ({}));

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const process = async () => {
    try {
      const phone = onlyDigits(
        body?.Customer?.mobile || body?.customer?.phone || body?.Customer?.phone || body?.phone || "",
      );
      const status = String(body?.order_status || body?.status || "").toLowerCase();
      if (!phone) {
        console.log("Kiwify: telefone não encontrado no payload.");
        return;
      }
      if (status && !["paid", "approved", "aprovado", "pago", "paid_out"].includes(status)) return;

      let { data: contact } = await supabase.from("contacts").select("*").eq("number", phone).maybeSingle();

      let flow = null as { id: string; purchase_messages: unknown[] } | null;
      if (contact?.flow_id) {
        const { data: f } = await supabase.from("flows").select("*").eq("id", contact.flow_id).maybeSingle();
        flow = f;
      }
      if (!flow) {
        const { data: f } = await supabase.from("flows").select("*").eq("active", true).limit(1).maybeSingle();
        flow = f;
      }

      if (!contact) {
        await supabase.from("contacts").insert({
          number: phone,
          name: body?.Customer?.full_name || null,
          status: "comprou",
          flow_id: flow ? flow.id : null,
        });
        const { data: c } = await supabase.from("contacts").select("*").eq("number", phone).maybeSingle();
        contact = c;
      } else {
        await supabase.from("contacts").update({ status: "comprou" }).eq("number", phone);
      }

      await supabase.from("jobs").update({ done: true }).eq("number", phone).eq("done", false);

      if (flow?.purchase_messages) {
        await sendMessages(phone, flow.purchase_messages as never, contact);
      }

      // Avisa a Meta que essa lead virou compra — o valor tenta vir do próprio payload da
      // Kiwify; se o campo não existir com esse nome, cai no preço padrão de R$79.
      // Vale conferir o nome exato do campo assim que chegar um webhook real de teste.
      const amount = Number(body?.Product?.product_amount ?? body?.amount ?? body?.order_amount) || 79;
      await sendMetaEvent({ eventName: "Purchase", phone, value: amount, eventId: `purchase-${phone}` });

      console.log("✅ Compra confirmada:", phone);
    } catch (e) {
      console.error("Erro no kiwify-webhook:", e instanceof Error ? e.message : e);
    }
  };

  // @ts-ignore
  if (typeof EdgeRuntime !== "undefined") {
    // @ts-ignore
    EdgeRuntime.waitUntil(process());
  } else {
    await process();
  }

  return new Response("OK", { status: 200, headers: corsHeaders });
});
