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

-- ---- Semente: fluxo padrão do Jejum de Daniel (Turma de Estreia) ----------
insert into public.flows (name, steps, purchase_messages, no_sale_messages, active)
select
  'Jejum de Daniel — Turma de Estreia',
  '[
    {"delayMin":0,"type":"send","messages":[
      {"type":"text","text":"Que alegria ter você aqui! 🙌 Deus preparou algo lindo pra esses seus próximos dias."},
      {"type":"text","text":"Aqui está o seu *Guia do Jejum de Daniel* pra você já começar a se preparar:"},
      {"type":"media","mediatype":"document","fileName":"Guia-do-Jejum-de-Daniel.pdf","caption":"📄 Guia do Jejum de Daniel","url":""},
      {"type":"text","text":"E me conta, pra eu já orar por você: *qual o principal motivo que te levou a buscar esse jejum agora?* 💬"}
    ]},
    {"delayMin":2,"type":"send","messages":[
      {"type":"text","text":"Deixa eu te contar uma novidade especial. 💛\n\nEstou abrindo a *Turma de Estreia* do Jejum de Daniel Guiado — 21 dias em que você recebe, todo dia aqui no WhatsApp, um versículo, uma oração guiada e o foco do dia, com uma turma que começa *{{data_inicio}}*."},
      {"type":"text","text":"Fazer sozinha é difícil (a maioria desiste na 1ª semana). Guiada e em turma, você chega até o fim. 🙏\n\nComo você é uma das *primeiras*, leva o *bônus de fundadora*: o Kit completo (áudios das orações + receituário) e 1 mês da comunidade Manhã Espiritual — tudo incluso."},
      {"type":"text","text":"As vagas são limitadas e as inscrições vão só até *{{data_limite}}*.\n\n✨ Quero ser fundadora 👉 {{link}}"}
    ]},
    {"delayMin":180,"type":"send","messages":[
      {"type":"text","text":"{{nome}}, as vagas da Turma de Estreia estão acabando 🙏\n\nUma coisa que ouço muito: \"eu nunca tinha conseguido terminar um jejum — com o acompanhamento diário, dessa vez cheguei ao fim renovada.\"\n\nNão quero que você fique de fora 👉 {{link}}"}
    ]},
    {"delayMin":1440,"type":"send","messages":[
      {"type":"text","text":"Bom dia! ☀️ Começa o dia com a Palavra:\n\n\"Daniel firmou o propósito de não se contaminar.\" (Dn 1:8) — tudo começa com uma decisão do coração. Hoje, escolha buscar a Deus em primeiro lugar. 🙏"},
      {"type":"text","text":"É assim, todo dia, na turma. As inscrições da estreia fecham *{{data_limite}}*:\n\nQuero participar 👉 {{link}}"}
    ]},
    {"delayMin":2880,"type":"send","messages":[
      {"type":"text","text":"{{nome}}, faltam poucos dias pras inscrições da Turma de Estreia fecharem (*{{data_limite}}*) ⏳\n\nImagina daqui a 21 dias: uma rotina de oração firmada, mais paz, mais perto de Deus — e acompanhada o caminho todo, não sozinha."},
      {"type":"text","text":"E ainda com o bônus de fundadora, que só existe nesta primeira turma. 💛\n\nQuero minha vaga 👉 {{link}}"}
    ]},
    {"delayMin":4320,"type":"send","messages":[
      {"type":"text","text":"🚨 Últimas horas! As inscrições da Turma de Estreia encerram *hoje à noite*.\n\nSe ficou na dúvida, me chama aqui que eu te ajudo. Mas se o seu coração já disse sim 👉 {{link}}"}
    ]},
    {"delayMin":4380,"type":"action","action":"mark_nao_comprou"}
  ]'::jsonb,
  '[
    {"type":"text","text":"🎉 Bem-vinda, fundadora {{nome}}! Que honra ter você na Turma de Estreia. 🙏"},
    {"type":"text","text":"Seu material de preparação já está a caminho: 📄 Planner · 🎧 Áudios · 🍃 Receituário.\n\nVocê já entra no *Canal da Turma de Estreia* ✅. Começamos juntas em *{{data_inicio}}* — prepare o coração!"}
  ]'::jsonb,
  '[
    {"type":"text","text":"Tudo bem não ter dado certo desta vez 💛 Vou te enviando uma palavra de vez em quando e te aviso quando abrir a próxima turma.\n\n(Se não quiser mais receber, é só responder SAIR.)"}
  ]'::jsonb,
  true
where not exists (select 1 from public.flows);
