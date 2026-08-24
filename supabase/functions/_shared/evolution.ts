// Cliente da Evolution API (WhatsApp) — porte de jejum-bot/src/evolution.js para Deno.
const EVOLUTION_URL = (Deno.env.get("EVOLUTION_URL") || "http://localhost:8080").replace(/\/$/, "");
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_KEY") || "";
const INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "jejum";

async function evoFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(EVOLUTION_URL + path, {
    ...init,
    headers: {
      apikey: EVOLUTION_KEY,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // resposta não era JSON — mantém texto cru
  }
  if (!res.ok) {
    throw new Error(`Evolution API ${path} -> ${res.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }
  return data;
}

// Cria a instância (se não existir) e retorna o QR Code para escanear no WhatsApp.
export async function connectInstance() {
  try {
    return await evoFetch("/instance/create", {
      method: "POST",
      body: JSON.stringify({ instanceName: INSTANCE, integration: "WHATSAPP-BAILEYS", qrcode: true }),
    });
  } catch {
    // Se a instância já existe, apenas pede a conexão/QR novamente.
    return await evoFetch("/instance/connect/" + INSTANCE, { method: "GET" });
  }
}

export async function setWebhook(publicUrl: string) {
  const url = publicUrl.replace(/\/$/, "") + "/functions/v1/evolution-webhook";
  return evoFetch("/webhook/set/" + INSTANCE, {
    method: "POST",
    body: JSON.stringify({ webhook: { enabled: true, url, events: ["MESSAGES_UPSERT"] } }),
  });
}

export async function sendText(number: string, text: string) {
  return evoFetch("/message/sendText/" + INSTANCE, {
    method: "POST",
    body: JSON.stringify({ number, text }),
  });
}

export async function sendMedia(
  number: string,
  { url, caption = "", fileName = "arquivo.pdf", mediatype = "document" }:
    { url: string; caption?: string; fileName?: string; mediatype?: string },
) {
  return evoFetch("/message/sendMedia/" + INSTANCE, {
    method: "POST",
    body: JSON.stringify({ number, mediatype, media: url, caption, fileName }),
  });
}

export function replaceVars(text: string, contact: { name?: string | null }) {
  const primeiroNome = contact?.name ? String(contact.name).split(" ")[0] : "amiga";
  const VARS = {
    data_inicio: Deno.env.get("DATA_INICIO") || "[DATA-INÍCIO]",
    data_limite: Deno.env.get("DATA_LIMITE") || "[DATA-LIMITE]",
    link: Deno.env.get("LINK_CHECKOUT") || "[LINK]",
    guia_url: Deno.env.get("GUIA_URL") || "",
  };
  return String(text)
    .replace(/{{nome}}/g, primeiroNome)
    .replace(/{{data_inicio}}/g, VARS.data_inicio)
    .replace(/{{data_limite}}/g, VARS.data_limite)
    .replace(/{{link}}/g, VARS.link);
}

export function guiaUrl() {
  return Deno.env.get("GUIA_URL") || "";
}

type Msg = { type: "text" | "media"; text?: string; url?: string; caption?: string; fileName?: string; mediatype?: string };

export async function sendMessages(number: string, msgs: Msg[] | undefined, contact: { name?: string | null }) {
  for (const m of msgs || []) {
    try {
      if (m.type === "media") {
        await sendMedia(number, {
          url: m.url || guiaUrl(),
          caption: m.caption ? replaceVars(m.caption, contact) : "",
          fileName: m.fileName || "arquivo.pdf",
          mediatype: m.mediatype || "document",
        });
      } else {
        await sendText(number, replaceVars(m.text || "", contact));
      }
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error("Erro ao enviar para", number, e instanceof Error ? e.message : e);
    }
  }
}
