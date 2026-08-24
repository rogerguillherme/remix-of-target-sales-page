-- ============================================================================
--  Jejum Bot — schema (contacts, jobs, flows) + controle de acesso do painel
-- ============================================================================

-- ---- Admins autorizados a usar o painel do Jejum Bot ----------------------
create table if not exists public.jejum_admins (
  email text primary key
);

alter table public.jejum_admins enable row level security;
-- Sem policies para anon/authenticated: só service_role (edge functions, migrations) enxerga esta tabela.

insert into public.jejum_admins (email)
values ('treinador.rogerbendlin@gmail.com')
on conflict (email) do nothing;

-- Função auxiliar (SECURITY DEFINER) usada nas policies abaixo para checar admin.
create or replace function public.is_jejum_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.jejum_admins
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- ---- Fluxos (o roteiro de mensagens editado no painel) --------------------
create table if not exists public.flows (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Novo fluxo',
  steps jsonb not null default '[]'::jsonb,
  purchase_messages jsonb not null default '[]'::jsonb,
  no_sale_messages jsonb not null default '[]'::jsonb,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.flows enable row level security;

create policy "admin manages flows"
  on public.flows
  for all
  using (public.is_jejum_admin())
  with check (public.is_jejum_admin());

-- Garante um único fluxo ativo por vez.
create unique index if not exists flows_single_active_idx
  on public.flows (active)
  where active;

-- ---- Contatos (leads que entraram no fluxo) --------------------------------
create table if not exists public.contacts (
  number text primary key,
  name text,
  status text not null default 'lead', -- 'lead' | 'comprou' | 'nao_comprou'
  flow_id uuid references public.flows(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "admin manages contacts"
  on public.contacts
  for all
  using (public.is_jejum_admin())
  with check (public.is_jejum_admin());

-- ---- Jobs (mensagens agendadas por contato) --------------------------------
create table if not exists public.jobs (
  id bigint generated always as identity primary key,
  number text not null references public.contacts(number) on delete cascade,
  flow_id uuid references public.flows(id) on delete set null,
  stage int not null,
  run_at timestamptz not null,
  done boolean not null default false
);

create index if not exists jobs_due_idx on public.jobs (done, run_at);

alter table public.jobs enable row level security;

create policy "admin manages jobs"
  on public.jobs
  for all
  using (public.is_jejum_admin())
  with check (public.is_jejum_admin());

-- ---- Semente: fluxo padrão do Jejum de Daniel (convite direto, sem turma) --
insert into public.flows (name, steps, purchase_messages, no_sale_messages, active)
select
  'Jejum de Daniel — Convite direto',
  '[
    {"delayMin":0,"type":"send","messages":[
      {"type":"text","text":"Que alegria ter você aqui! 🙌 Deus preparou algo lindo pra esses seus próximos dias."},
      {"type":"text","text":"Aqui está o seu *Guia do Jejum de Daniel* pra você já começar a se preparar:"},
      {"type":"media","mediatype":"document","fileName":"Guia-do-Jejum-de-Daniel.pdf","caption":"📄 Guia do Jejum de Daniel","url":""},
      {"type":"text","text":"E me conta, pra eu já orar por você: *qual o principal motivo que te levou a buscar esse jejum agora?* 💬"}
    ]},
    {"delayMin":2,"type":"send","messages":[
      {"type":"text","text":"Separei uma coisa especial pra você. 💛\n\nO *Jejum de Daniel Guiado*: 21 dias em que você recebe, todo dia aqui no WhatsApp, um versículo, uma oração guiada e o foco do dia — pra você não fazer esse caminho sozinha."},
      {"type":"text","text":"É por *R$79*, com *7 dias de teste*: se sentir que não é pra você, é só pedir e devolvemos tudo, sem burocracia."},
      {"type":"text","text":"Quer começar agora? 👉 {{link}}"}
    ]},
    {"delayMin":180,"type":"send","messages":[
      {"type":"text","text":"Fazer o jejum sozinha costuma ser difícil — a maioria desiste na 1ª semana por falta de direção. 🙏\n\nGuiada, você tem o passo a passo todo dia, direto aqui no WhatsApp. Ainda dá tempo de começar hoje 👉 {{link}}"}
    ]},
    {"delayMin":1440,"type":"send","messages":[
      {"type":"text","text":"Bom dia! ☀️ Começa o dia com a Palavra:\n\n\"Daniel firmou o propósito de não se contaminar.\" (Dn 1:8) — tudo começa com uma decisão do coração. A sua pode ser hoje."},
      {"type":"text","text":"Comece o Jejum de Daniel Guiado agora 👉 {{link}}"}
    ]},
    {"delayMin":2880,"type":"send","messages":[
      {"type":"text","text":"Uma coisa que ouço bastante de quem já fez: \"sozinha eu nunca tinha conseguido terminar um jejum — guiada, dessa vez cheguei ao fim renovada.\" 🙏\n\nPode ser assim com você também 👉 {{link}}"}
    ]},
    {"delayMin":4320,"type":"send","messages":[
      {"type":"text","text":"{{nome}}, ainda dá tempo de começar o Jejum de Daniel Guiado — 21 dias com devocional diário, oração guiada e todo o suporte por aqui.\n\nR$79, com garantia de 7 dias. Se ficou na dúvida, me chama que eu te ajudo. Se o coração já disse sim 👉 {{link}}"}
    ]},
    {"delayMin":7200,"type":"action","action":"mark_nao_comprou"}
  ]'::jsonb,
  '[
    {"type":"text","text":"🎉 Que alegria, {{nome}}! Seja muito bem-vinda ao Jejum de Daniel Guiado. 🙏"},
    {"type":"text","text":"Seu material já está a caminho: 📄 Planner · 🎧 Áudios de oração · 🍃 Receituário. Você já pode começar quando quiser — não precisa esperar ninguém. Qualquer dúvida, é só chamar por aqui. 💛"}
  ]'::jsonb,
  '[
    {"type":"text","text":"Tudo bem não ter sido agora 💛 Vou te mandando uma palavra de vez em quando.\n\nSe quiser começar o Jejum de Daniel Guiado quando fizer mais sentido pra você, é só me chamar aqui. (Se preferir não receber mais nada, é só responder SAIR.)"}
  ]'::jsonb,
  true
where not exists (select 1 from public.flows);
