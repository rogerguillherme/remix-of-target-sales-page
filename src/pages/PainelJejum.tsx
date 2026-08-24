import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, Plus, Trash2, Save, RefreshCw, QrCode } from "lucide-react";

type FlowMsg = {
  type: "text" | "media";
  text?: string;
  url?: string;
  caption?: string;
  fileName?: string;
  mediatype?: string;
};
type FlowStep = {
  delayMin: number;
  type: "send" | "action";
  action?: string;
  messages?: FlowMsg[];
};
type FlowRow = {
  id: string;
  name: string;
  steps: FlowStep[];
  purchase_messages: FlowMsg[];
  no_sale_messages: FlowMsg[];
  active: boolean;
};
type FlowListItem = { id: string; name: string; active: boolean };
type Contact = { number: string; name: string | null; status: string; created_at: string };

function humanDelay(min: number) {
  min = Number(min) || 0;
  if (min === 0) return "Envia imediatamente";
  if (min < 60) return `Envia ~${min} min depois`;
  if (min < 1440) return `Envia ~${(min / 60).toFixed(1).replace(".0", "")}h depois`;
  return `Envia ~${(min / 1440).toFixed(1).replace(".0", "")} dia(s) depois`;
}

function emptyMsg(): FlowMsg {
  return { type: "text", text: "" };
}

// ---- editor de uma mensagem (texto ou mídia) ----
function MessageEditor({
  msg,
  onChange,
  onRemove,
}: {
  msg: FlowMsg;
  onChange: (m: FlowMsg) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border rounded-lg p-3 mb-2 bg-muted/30 space-y-2">
      <div className="flex gap-2 items-center">
        <Select value={msg.type} onValueChange={(v) => onChange({ ...msg, type: v as "text" | "media" })}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="media">Mídia (PDF/imagem)</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" size="icon" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      {msg.type === "text" ? (
        <Textarea
          placeholder="Escreva a mensagem..."
          value={msg.text || ""}
          onChange={(e) => onChange({ ...msg, text: e.target.value })}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Tipo de mídia</Label>
            <Select
              value={msg.mediatype || "document"}
              onValueChange={(v) => onChange({ ...msg, mediatype: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Documento (PDF)</SelectItem>
                <SelectItem value="image">Imagem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Nome do arquivo</Label>
            <Input
              placeholder="ex.: guia.pdf"
              value={msg.fileName || ""}
              onChange={(e) => onChange({ ...msg, fileName: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">URL (vazio = usa GUIA_URL)</Label>
            <Input
              placeholder="https://..."
              value={msg.url || ""}
              onChange={(e) => onChange({ ...msg, url: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Legenda (opcional)</Label>
            <Input
              value={msg.caption || ""}
              onChange={(e) => onChange({ ...msg, caption: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MessageListEditor({
  messages,
  onChange,
}: {
  messages: FlowMsg[];
  onChange: (m: FlowMsg[]) => void;
}) {
  return (
    <div>
      {messages.map((m, i) => (
        <MessageEditor
          key={i}
          msg={m}
          onChange={(nm) => onChange(messages.map((x, xi) => (xi === i ? nm : x)))}
          onRemove={() => onChange(messages.filter((_, xi) => xi !== i))}
        />
      ))}
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...messages, emptyMsg()])}>
        <Plus className="h-3 w-3 mr-1" /> Mensagem
      </Button>
    </div>
  );
}

// ---- editor de uma etapa ----
function StepEditor({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: FlowStep;
  index: number;
  onChange: (s: FlowStep) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border-l-4 border-primary rounded-lg p-3 mb-3 bg-muted/20">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-sm">Etapa {index + 1}</span>
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" /> Remover
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Enviar após (minutos)</Label>
          <Input
            type="number"
            value={step.delayMin || 0}
            onChange={(e) => onChange({ ...step, delayMin: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select
            value={step.type}
            onValueChange={(v) =>
              onChange(
                v === "action"
                  ? { ...step, type: "action", action: "mark_nao_comprou" }
                  : { ...step, type: "send", messages: step.messages || [emptyMsg()] },
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="send">Enviar mensagens</SelectItem>
              <SelectItem value="action">Encerrar (não comprou)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{humanDelay(step.delayMin || 0)}</p>
      {step.type === "send" ? (
        <div className="mt-2">
          <MessageListEditor
            messages={step.messages || []}
            onChange={(msgs) => onChange({ ...step, messages: msgs })}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-2">
          Esta etapa marca o contato como "não comprou" e envia as mensagens de nutrição.
        </p>
      )}
    </div>
  );
}

const PainelJejum = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [flows, setFlows] = useState<FlowListItem[]>([]);
  const [editing, setEditing] = useState<FlowRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [qr, setQr] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    checkAuth();
    loadFlows();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    const { data: admin } = await supabase
      .from("jejum_admins")
      .select("email")
      .eq("email", session.user.email)
      .maybeSingle();
    if (!admin) {
      toast({ title: "Acesso não autorizado", description: "Este login não tem acesso ao painel do Jejum Bot.", variant: "destructive" });
      await supabase.auth.signOut();
      navigate("/login");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ---- fluxos ----
  const loadFlows = async () => {
    const { data, error } = await supabase.from("flows").select("id,name,active").order("created_at");
    if (error) {
      toast({ title: "Erro ao carregar fluxos", description: error.message, variant: "destructive" });
      return;
    }
    setFlows(data || []);
  };

  const openEditor = async (id: string) => {
    const { data, error } = await supabase.from("flows").select("*").eq("id", id).single();
    if (error) {
      toast({ title: "Erro ao abrir fluxo", description: error.message, variant: "destructive" });
      return;
    }
    setEditing(data as unknown as FlowRow);
  };

  const newFlow = () => {
    setEditing({
      id: "",
      name: "Novo fluxo",
      steps: [{ delayMin: 0, type: "send", messages: [emptyMsg()] }],
      purchase_messages: [],
      no_sale_messages: [],
      active: false,
    });
  };

  const activateFlow = async (id: string) => {
    await supabase.from("flows").update({ active: false }).neq("id", id);
    const { error } = await supabase.from("flows").update({ active: true }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao ativar fluxo", description: error.message, variant: "destructive" });
      return;
    }
    loadFlows();
  };

  const deleteFlow = async (id: string) => {
    if (!confirm("Excluir este fluxo?")) return;
    const { error } = await supabase.from("flows").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir fluxo", description: error.message, variant: "destructive" });
      return;
    }
    loadFlows();
  };

  const saveFlow = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      name: editing.name,
      steps: editing.steps as unknown,
      purchase_messages: editing.purchase_messages as unknown,
      no_sale_messages: editing.no_sale_messages as unknown,
    };
    const { error } = editing.id
      ? await supabase.from("flows").update(payload as never).eq("id", editing.id)
      : await supabase.from("flows").insert(payload as never);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Fluxo salvo!" });
    setEditing(null);
    loadFlows();
  };

  // ---- conexão ----
  const genQR = async () => {
    setQrLoading(true);
    setQr(null);
    try {
      const { data, error } = await supabase.functions.invoke("evolution-connect", { method: "POST" as never, body: {} });
      if (error) throw error;
      const b64 = data?.base64 || data?.qrcode?.base64 || data?.qrcode || data?.code;
      if (b64 && String(b64).startsWith("data:image")) setQr(b64);
      else if (b64 && String(b64).length > 100) setQr(`data:image/png;base64,${b64}`);
      else
        toast({
          title: "QR não retornado",
          description: "Se o número já está conectado, está tudo certo.",
        });
    } catch (e) {
      toast({
        title: "Erro ao gerar QR",
        description: e instanceof Error ? e.message : "Verifique EVOLUTION_URL/EVOLUTION_KEY nos secrets.",
        variant: "destructive",
      });
    } finally {
      setQrLoading(false);
    }
  };

  const setupWebhook = async () => {
    if (!webhookUrl) return;
    try {
      const { error } = await supabase.functions.invoke("evolution-connect", {
        body: { setupWebhookUrl: webhookUrl },
      });
      if (error) throw error;
      toast({ title: "Webhook configurado!" });
    } catch (e) {
      toast({ title: "Erro ao configurar webhook", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  // ---- leads ----
  const loadContacts = async () => {
    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar leads", description: error.message, variant: "destructive" });
      return;
    }
    setContacts((data || []) as Contact[]);
  };

  const statusBadge = (s: string) => {
    if (s === "comprou") return <Badge className="bg-green-600 hover:bg-green-600">comprou</Badge>;
    if (s === "nao_comprou") return <Badge variant="secondary">não comprou</Badge>;
    return <Badge variant="outline">lead</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">🙏 Jejum Bot — Painel</h1>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sair
          </Button>
        </div>

        <Tabs defaultValue="fluxos" onValueChange={(v) => v === "leads" && loadContacts()}>
          <TabsList>
            <TabsTrigger value="fluxos">🔧 Fluxos</TabsTrigger>
            <TabsTrigger value="conexao">📱 Conexão</TabsTrigger>
            <TabsTrigger value="leads">👥 Leads</TabsTrigger>
          </TabsList>

          {/* FLUXOS */}
          <TabsContent value="fluxos" className="space-y-4">
            {!editing ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Meus fluxos</CardTitle>
                  <Button size="sm" onClick={newFlow}>
                    <Plus className="h-4 w-4 mr-1" /> Novo fluxo
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {flows.map((f) => (
                    <div key={f.id} className="flex justify-between items-center border rounded-lg p-3 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <b>{f.name}</b>
                        {f.active && <Badge className="bg-green-600 hover:bg-green-600">ATIVO</Badge>}
                      </div>
                      <div className="flex gap-2">
                        {!f.active && (
                          <Button size="sm" variant="outline" onClick={() => activateFlow(f.id)}>
                            Ativar
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openEditor(f.id)}>
                          Editar
                        </Button>
                        {!f.active && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteFlow(f.id)}>
                            Excluir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!flows.length && <p className="text-sm text-muted-foreground">Nenhum fluxo ainda.</p>}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Editar fluxo</CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                    Fechar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nome do fluxo</Label>
                    <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Etapas (régua de mensagens)</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Variáveis: <code>{"{{nome}} {{data_inicio}} {{data_limite}} {{link}}"}</code>. Mídia sem URL usa o GUIA_URL configurado nos secrets.
                    </p>
                    {editing.steps.map((s, i) => (
                      <StepEditor
                        key={i}
                        step={s}
                        index={i}
                        onChange={(ns) => setEditing({ ...editing, steps: editing.steps.map((x, xi) => (xi === i ? ns : x)) })}
                        onRemove={() => setEditing({ ...editing, steps: editing.steps.filter((_, xi) => xi !== i) })}
                      />
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditing({ ...editing, steps: [...editing.steps, { delayMin: 0, type: "send", messages: [emptyMsg()] }] })
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" /> Adicionar etapa
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Mensagens ao COMPRAR</h3>
                    <MessageListEditor
                      messages={editing.purchase_messages}
                      onChange={(m) => setEditing({ ...editing, purchase_messages: m })}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Mensagens de quem NÃO comprou</h3>
                    <MessageListEditor
                      messages={editing.no_sale_messages}
                      onChange={(m) => setEditing({ ...editing, no_sale_messages: m })}
                    />
                  </div>

                  <Button onClick={saveFlow} disabled={saving}>
                    <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando..." : "Salvar fluxo"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CONEXAO */}
          <TabsContent value="conexao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vincular número do WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Clique para gerar o QR Code e escaneie no WhatsApp (Aparelhos conectados).
                </p>
                <Button onClick={genQR} disabled={qrLoading}>
                  <QrCode className="h-4 w-4 mr-1" /> {qrLoading ? "Gerando..." : "Gerar QR Code"}
                </Button>
                {qr && (
                  <div className="bg-white p-3 rounded-lg inline-block">
                    <img src={qr} alt="QR Code WhatsApp" className="max-w-[280px]" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Configurar webhook</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  URL pública deste projeto Supabase (a Evolution vai chamar {"<url>"}/functions/v1/evolution-webhook).
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://SEU_PROJECT_ID.supabase.co"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <Button onClick={setupWebhook}>Configurar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LEADS */}
          <TabsContent value="leads">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leads</CardTitle>
                <Button size="sm" variant="ghost" onClick={loadContacts}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((c) => (
                      <TableRow key={c.number}>
                        <TableCell>{c.number}</TableCell>
                        <TableCell>{c.name || ""}</TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                      </TableRow>
                    ))}
                    {!contacts.length && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum lead ainda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PainelJejum;
