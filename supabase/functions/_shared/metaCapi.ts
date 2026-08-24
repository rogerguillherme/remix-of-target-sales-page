// Envia eventos server-side pra API de Conversões da Meta (Contato / Comprar).
// Documentação: https://developers.facebook.com/docs/marketing-api/conversions-api

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Garante o número no formato que a Meta espera pro hash: só dígitos, com DDI do Brasil.
function normalizePhone(number: string): string {
  const digits = (number || "").replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  return "55" + digits;
}

type MetaEventName = "Contact" | "Purchase";

export async function sendMetaEvent({
  eventName,
  phone,
  value,
  currency = "BRL",
  eventId,
}: {
  eventName: MetaEventName;
  phone: string;
  value?: number;
  currency?: string;
  // Use o mesmo id do lado do Pixel (se houver) pra Meta deduplicar — aqui, um id estável por evento.
  eventId?: string;
}) {
  const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
  const ACCESS_TOKEN = Deno.env.get("META_CAPI_ACCESS_TOKEN");

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("Meta CAPI não configurado (faltam META_PIXEL_ID / META_CAPI_ACCESS_TOKEN) — evento não enviado:", eventName);
    return;
  }

  try {
    const hashedPhone = await sha256Hex(normalizePhone(phone));

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "business_messaging",
          messaging_channel: "whatsapp",
          user_data: {
            ph: [hashedPhone],
          },
          ...(value != null
            ? { custom_data: { value, currency } }
            : {}),
        },
      ],
    };

    const res = await fetch(
      `https://graph.facebook.com/v20.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Meta CAPI erro:", res.status, JSON.stringify(data));
    } else {
      console.log("Meta CAPI evento enviado:", eventName, JSON.stringify(data));
    }
  } catch (e) {
    console.error("Meta CAPI exceção:", e instanceof Error ? e.message : e);
  }
}
