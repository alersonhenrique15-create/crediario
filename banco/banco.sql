-- ===========================================================================
--  CREDIARIO TECNO CELL - banco de dados
--  Cole este arquivo INTEIRO no SQL Editor do Supabase e clique em RUN.
--  Pode rodar mais de uma vez sem problema (nao apaga dados).
-- ===========================================================================

do $$ begin
  create extension if not exists pgcrypto;
exception when others then
  raise notice 'pgcrypto nao instalado (%). Sem problema: nao e obrigatorio.', sqlerrm;
end $$;
-- pg_net = permite o banco mandar notificacao e WhatsApp sozinho.
-- Se der erro aqui, ative em Database > Extensions > pg_net e rode de novo.
do $$ begin
  create extension if not exists pg_net;
exception when others then
  raise notice 'pg_net nao instalado agora (%). O sistema funciona, mas sem envio automatico.', sqlerrm;
end $$;

-- ---------------------------------------------------------------------------
-- 1. EQUIPE  (Camila, Andreia, Alerson)
-- ---------------------------------------------------------------------------
create table if not exists public.perfis (
  id           uuid primary key references auth.users(id) on delete cascade,
  nome         text not null,
  usuario      text not null unique,
  papel        text not null default 'vendedor' check (papel in ('vendedor','admin')),
  pode_decidir boolean not null default false,
  ativo        boolean not null default true,
  criado_em    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. REGRAS DA ANALISE (todo mundo da equipe le, so o admin muda)
-- ---------------------------------------------------------------------------
create table if not exists public.regras (
  id           int primary key default 1 check (id = 1),
  score_min    int not null default 70,
  teto_pct     int not null default 30,
  juros_mes    numeric(6,3) not null default 0,
  loja_whats   text not null default '',
  atualizado_em timestamptz not null default now()
);
insert into public.regras (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. INTEGRACOES (tokens - SO O ADMIN ve)
-- ---------------------------------------------------------------------------
create table if not exists public.integracoes (
  id              int primary key default 1 check (id = 1),
  telegram_token  text,
  telegram_chat   text,
  wa_provider     text default '' check (wa_provider in ('','zapi','evolution','cloud','webhook')),
  wa_url          text,
  wa_token        text,
  notificar_admin_wa boolean not null default false,
  admin_whats     text,
  enviar_auto     boolean not null default true,
  atualizado_em   timestamptz not null default now()
);
insert into public.integracoes (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. FICHAS
-- ---------------------------------------------------------------------------
create sequence if not exists public.protocolo_seq;

create table if not exists public.fichas (
  id          uuid primary key default gen_random_uuid(),
  protocolo   text not null unique,
  criado_em   timestamptz not null default now(),

  nome        text not null,
  cpf         text not null,
  nascimento  text,
  telefone    text not null,
  endereco    text,
  mae         text,

  vinculo     text,
  empresa     text,
  cargo       text,
  tempo_emprego text,
  renda       numeric(12,2) not null default 0,
  outras_parcelas numeric(12,2) not null default 0,

  produto     text,
  valor       numeric(12,2) not null default 0,
  entrada     numeric(12,2) not null default 0,
  parcelas    int not null default 12,
  historico_loja text,

  ref1_nome text, ref1_fone text, ref2_nome text, ref2_fone text,
  autorizou_consulta boolean not null default false,

  origem      text not null default 'link' check (origem in ('link','vendedor')),
  vendedor    text,

  status      text not null default 'novo'
              check (status in ('novo','analisando','aprovado','contraproposta','recusado')),
  visto       boolean not null default false,
  conferencia jsonb not null default '{}'::jsonb,
  score       int,
  parcela_calc numeric(12,2),
  comprometimento numeric(6,2),
  observacao  text,
  mensagem_enviada text,
  decidido_em timestamptz,
  decidido_por text,
  ip_hash     text
);
create index if not exists fichas_status_idx on public.fichas (status, criado_em desc);
create index if not exists fichas_criado_idx on public.fichas (criado_em desc);
create index if not exists fichas_cpf_idx    on public.fichas (cpf);

-- ---------------------------------------------------------------------------
-- 5. LOG DE ENVIOS (notificacao / WhatsApp)
-- ---------------------------------------------------------------------------
create table if not exists public.envios (
  id         bigserial primary key,
  ficha_id   uuid references public.fichas(id) on delete set null,
  canal      text,
  destino    text,
  request_id bigint,
  erro       text,
  criado_em  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. FUNCOES AUXILIARES
-- ---------------------------------------------------------------------------
create or replace function public.so_digitos(t text) returns text
language sql immutable as $$ select regexp_replace(coalesce(t,''), '[^0-9]', '', 'g') $$;

-- telefone no formato que o WhatsApp entende: 55 + DDD + numero
create or replace function public.fone_wa(t text) returns text
language plpgsql immutable as $$
declare d text := public.so_digitos(t);
begin
  if length(d) in (10,11) then d := '55' || d; end if;
  return d;
end $$;

create or replace function public.cpf_valido(t text) returns boolean
language plpgsql immutable as $$
declare d text := public.so_digitos(t); s int := 0; r int; i int;
begin
  if length(d) <> 11 then return false; end if;
  if d = repeat(substr(d,1,1), 11) then return false; end if;
  for i in 1..9 loop s := s + substr(d,i,1)::int * (11 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  if r <> substr(d,10,1)::int then return false; end if;
  s := 0;
  for i in 1..10 loop s := s + substr(d,i,1)::int * (12 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  return r = substr(d,11,1)::int;
end $$;

-- quem sou eu, pelo login
create or replace function public.meu_perfil() returns public.perfis
language sql stable security definer set search_path = public as $$
  select * from public.perfis where id = auth.uid() and ativo
$$;

create or replace function public.sou_equipe() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfis where id = auth.uid() and ativo)
$$;

create or replace function public.sou_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfis where id = auth.uid() and ativo and papel = 'admin')
$$;

create or replace function public.posso_decidir() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and ativo and (papel = 'admin' or pode_decidir)
  )
$$;
-- ---------------------------------------------------------------------------
-- 7. ENVIO DE MENSAGENS (Telegram e WhatsApp) - roda dentro do banco
-- ---------------------------------------------------------------------------
alter table public.regras add column if not exists painel_url text default '';

create or replace function public.brl(v numeric) returns text
language sql immutable as $$
  select 'R$ ' || replace(replace(replace(
           to_char(coalesce(v,0), 'FM999G999G990D00'), '.', '#'), ',', '.'), '#', ',')
$$;

-- manda um texto pelo WhatsApp usando o provedor configurado no painel
create or replace function public.enviar_whatsapp(p_fone text, p_msg text, p_ficha uuid default null)
returns boolean
language plpgsql security definer set search_path = public, net, extensions as $$
declare i public.integracoes; v_url text; v_body jsonb; v_head jsonb; v_rid bigint; v_fone text;
begin
  select * into i from public.integracoes where id = 1;
  if not found or coalesce(i.wa_provider,'') = '' or coalesce(i.wa_url,'') = '' then
    return false;
  end if;
  v_fone := public.fone_wa(p_fone);
  if length(v_fone) < 12 then return false; end if;

  if i.wa_provider = 'zapi' then
    v_url  := rtrim(i.wa_url, '/') || '/send-text';
    v_body := jsonb_build_object('phone', v_fone, 'message', p_msg);
    v_head := jsonb_build_object('Content-Type','application/json',
                                 'Client-Token', coalesce(i.wa_token,''));
  elsif i.wa_provider = 'evolution' then
    v_url  := rtrim(i.wa_url, '/');
    v_body := jsonb_build_object('number', v_fone, 'text', p_msg);
    v_head := jsonb_build_object('Content-Type','application/json',
                                 'apikey', coalesce(i.wa_token,''));
  elsif i.wa_provider = 'cloud' then
    v_url  := rtrim(i.wa_url, '/');
    v_body := jsonb_build_object('messaging_product','whatsapp','recipient_type','individual',
                                 'to', v_fone, 'type','text',
                                 'text', jsonb_build_object('preview_url', false, 'body', p_msg));
    v_head := jsonb_build_object('Content-Type','application/json',
                                 'Authorization','Bearer ' || coalesce(i.wa_token,''));
  else -- webhook generico (n8n, Make, Zapier...)
    v_url  := rtrim(i.wa_url, '/');
    v_body := jsonb_build_object('telefone', v_fone, 'mensagem', p_msg, 'ficha_id', p_ficha);
    v_head := case when coalesce(i.wa_token,'') <> ''
                   then jsonb_build_object('Content-Type','application/json',
                                           'Authorization','Bearer ' || i.wa_token)
                   else jsonb_build_object('Content-Type','application/json') end;
  end if;

  select net.http_post(url := v_url, body := v_body, headers := v_head,
                       timeout_milliseconds := 8000) into v_rid;
  insert into public.envios (ficha_id, canal, destino, request_id)
  values (p_ficha, 'whatsapp:' || i.wa_provider, v_fone, v_rid);
  return true;
exception when others then
  insert into public.envios (ficha_id, canal, destino, erro)
  values (p_ficha, 'whatsapp', p_fone, sqlerrm);
  return false;
end $$;

-- manda a notificacao instantanea para o dono (Telegram)
create or replace function public.notificar_telegram(p_texto text, p_ficha uuid default null)
returns boolean
language plpgsql security definer set search_path = public, net, extensions as $$
declare i public.integracoes; v_rid bigint;
begin
  select * into i from public.integracoes where id = 1;
  if not found or coalesce(i.telegram_token,'') = '' or coalesce(i.telegram_chat,'') = '' then
    return false;
  end if;
  select net.http_post(
    url     := 'https://api.telegram.org/bot' || i.telegram_token || '/sendMessage',
    body    := jsonb_build_object('chat_id', i.telegram_chat, 'text', p_texto,
                                  'parse_mode', 'HTML', 'disable_web_page_preview', true),
    headers := jsonb_build_object('Content-Type','application/json'),
    timeout_milliseconds := 8000) into v_rid;
  insert into public.envios (ficha_id, canal, destino, request_id)
  values (p_ficha, 'telegram', i.telegram_chat, v_rid);
  return true;
exception when others then
  insert into public.envios (ficha_id, canal, destino, erro)
  values (p_ficha, 'telegram', 'telegram', sqlerrm);
  return false;
end $$;

-- ---------------------------------------------------------------------------
-- 8. O CLIENTE MANDA A FICHA (unica porta de entrada do link publico)
-- ---------------------------------------------------------------------------
create or replace function public.enviar_ficha(p jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_proto text; v_id uuid; v_fone text; v_cpf text; v_nome text;
  v_renda numeric; v_valor numeric; v_parc int; v_ja record;
begin
  v_nome  := btrim(coalesce(p->>'nome',''));
  v_cpf   := public.so_digitos(p->>'cpf');
  v_fone  := public.fone_wa(p->>'telefone');
  v_renda := coalesce((p->>'renda')::numeric, 0);
  v_valor := coalesce((p->>'valor')::numeric, 0);
  v_parc  := coalesce((p->>'parcelas')::int, 12);

  if length(v_nome) < 5 or position(' ' in v_nome) = 0 then
    raise exception 'Escreva seu nome completo.' using errcode = 'P0001';
  end if;
  if not public.cpf_valido(v_cpf) then
    raise exception 'CPF invalido. Confira os numeros.' using errcode = 'P0001';
  end if;
  if length(v_fone) < 12 then
    raise exception 'WhatsApp invalido. Use DDD + numero.' using errcode = 'P0001';
  end if;
  if coalesce((p->>'autorizou_consulta')::boolean, false) is not true then
    raise exception 'E preciso autorizar a consulta do CPF.' using errcode = 'P0001';
  end if;
  if v_renda <= 0 or v_valor <= 0 then
    raise exception 'Informe a renda e o valor da compra.' using errcode = 'P0001';
  end if;
  if v_parc < 1 or v_parc > 36 then v_parc := 12; end if;

  -- clique duplo / ficha repetida: devolve a mesma que acabou de entrar
  select id, protocolo into v_ja from public.fichas
   where cpf = v_cpf and criado_em > now() - interval '15 minutes'
   order by criado_em desc limit 1;
  if found then
    return jsonb_build_object('protocolo', v_ja.protocolo, 'id', v_ja.id, 'repetida', true);
  end if;

  -- freio contra abuso do link publico
  if (select count(*) from public.fichas
        where cpf = v_cpf and criado_em > now() - interval '24 hours') >= 5 then
    raise exception 'Voce ja mandou varias fichas hoje. Fale com a loja no WhatsApp.'
      using errcode = 'P0001';
  end if;
  if (select count(*) from public.fichas
        where criado_em > now() - interval '1 minute') >= 20 then
    raise exception 'Muitas fichas ao mesmo tempo. Tente de novo em 1 minuto.'
      using errcode = 'P0001';
  end if;

  v_proto := 'TC-' || to_char(now() at time zone 'America/Sao_Paulo', 'MMDD')
             || '-' || lpad(((nextval('public.protocolo_seq') % 10000))::text, 4, '0');

  insert into public.fichas (
    protocolo, nome, cpf, nascimento, telefone, endereco, mae,
    vinculo, empresa, cargo, tempo_emprego, renda, outras_parcelas,
    produto, valor, entrada, parcelas, historico_loja,
    ref1_nome, ref1_fone, ref2_nome, ref2_fone,
    autorizou_consulta, origem, vendedor, ip_hash
  ) values (
    v_proto, v_nome, v_cpf, nullif(btrim(p->>'nascimento'),''), v_fone,
    nullif(btrim(p->>'endereco'),''), nullif(btrim(p->>'mae'),''),
    nullif(btrim(p->>'vinculo'),''), nullif(btrim(p->>'empresa'),''),
    nullif(btrim(p->>'cargo'),''), nullif(btrim(p->>'tempo_emprego'),''),
    v_renda, coalesce((p->>'outras_parcelas')::numeric, 0),
    nullif(btrim(p->>'produto'),''), v_valor, coalesce((p->>'entrada')::numeric, 0),
    v_parc, nullif(btrim(p->>'historico_loja'),''),
    nullif(btrim(p->>'ref1_nome'),''), nullif(btrim(p->>'ref1_fone'),''),
    nullif(btrim(p->>'ref2_nome'),''), nullif(btrim(p->>'ref2_fone'),''),
    true,
    case when coalesce(p->>'origem','link') = 'vendedor' then 'vendedor' else 'link' end,
    nullif(btrim(p->>'vendedor'),''),
    md5(coalesce(p->>'agente','') || v_cpf)
  ) returning id into v_id;

  return jsonb_build_object('protocolo', v_proto, 'id', v_id, 'repetida', false);
end $$;

-- ---------------------------------------------------------------------------
-- 9. GATILHOS: ficha nova avisa na hora / decisao vira WhatsApp
-- ---------------------------------------------------------------------------
create or replace function public.trg_ficha_nova() returns trigger
language plpgsql security definer set search_path = public as $$
declare i public.integracoes; r public.regras; txt text; link text;
begin
  select * into r from public.regras where id = 1;
  link := coalesce(nullif(r.painel_url,''), '');
  txt := '<b>NOVA FICHA DE CREDIARIO</b>' || E'\n' ||
         'Protocolo: ' || new.protocolo || E'\n\n' ||
         '<b>' || new.nome || '</b>' || E'\n' ||
         'WhatsApp: ' || new.telefone || E'\n' ||
         'Quer: ' || coalesce(new.produto,'(nao informou)') || ' - ' ||
            public.brl(new.valor) || ' em ' || new.parcelas || 'x' || E'\n' ||
         'Renda: ' || public.brl(new.renda) ||
            case when new.outras_parcelas > 0
                 then ' (ja paga ' || public.brl(new.outras_parcelas) || ')' else '' end ||
         case when new.origem = 'vendedor' and new.vendedor is not null
              then E'\n' || 'Preenchida por: ' || new.vendedor else '' end ||
         case when link <> '' then E'\n\n' || 'Abrir painel: ' || link else '' end;

  perform public.notificar_telegram(txt, new.id);

  select * into i from public.integracoes where id = 1;
  if found and i.notificar_admin_wa and coalesce(i.admin_whats,'') <> '' then
    perform public.enviar_whatsapp(
      i.admin_whats,
      'NOVA FICHA DE CREDIARIO' || E'\n' || 'Protocolo: ' || new.protocolo || E'\n\n' ||
      new.nome || E'\n' || 'WhatsApp: ' || new.telefone || E'\n' ||
      'Quer: ' || coalesce(new.produto,'-') || ' - ' || public.brl(new.valor) ||
      ' em ' || new.parcelas || 'x' || E'\n' || 'Renda: ' || public.brl(new.renda) ||
      case when link <> '' then E'\n\n' || link else '' end,
      new.id);
  end if;
  return null;
exception when others then
  insert into public.envios (ficha_id, canal, erro) values (new.id, 'aviso', sqlerrm);
  return null;
end $$;

drop trigger if exists ficha_nova on public.fichas;
create trigger ficha_nova after insert on public.fichas
  for each row execute function public.trg_ficha_nova();

create or replace function public.trg_ficha_decidida() returns trigger
language plpgsql security definer set search_path = public as $$
declare i public.integracoes;
begin
  select * into i from public.integracoes where id = 1;
  if found and i.enviar_auto and coalesce(new.mensagem_enviada,'') <> '' then
    perform public.enviar_whatsapp(new.telefone, new.mensagem_enviada, new.id);
  end if;
  return null;
exception when others then
  insert into public.envios (ficha_id, canal, erro) values (new.id, 'resposta', sqlerrm);
  return null;
end $$;

drop trigger if exists ficha_decidida on public.fichas;
create trigger ficha_decidida after update of status on public.fichas
  for each row
  when (new.status is distinct from old.status
        and new.status in ('aprovado','contraproposta','recusado'))
  execute function public.trg_ficha_decidida();
-- ---------------------------------------------------------------------------
-- 10. SEGURANCA: quem pode ver e mexer em cada coisa
-- ---------------------------------------------------------------------------
alter table public.perfis      enable row level security;
alter table public.regras      enable row level security;
alter table public.integracoes enable row level security;
alter table public.fichas      enable row level security;
alter table public.envios      enable row level security;

drop policy if exists perfis_ler       on public.perfis;
drop policy if exists perfis_admin     on public.perfis;
drop policy if exists regras_ler       on public.regras;
drop policy if exists regras_mudar     on public.regras;
drop policy if exists integra_admin    on public.integracoes;
drop policy if exists fichas_ler       on public.fichas;
drop policy if exists fichas_mudar     on public.fichas;
drop policy if exists fichas_apagar    on public.fichas;
drop policy if exists envios_admin     on public.envios;

create policy perfis_ler    on public.perfis    for select to authenticated
  using (id = auth.uid() or public.sou_admin());
create policy perfis_admin  on public.perfis    for all    to authenticated
  using (public.sou_admin()) with check (public.sou_admin());

create policy regras_ler    on public.regras    for select to authenticated
  using (public.sou_equipe());
create policy regras_mudar  on public.regras    for update to authenticated
  using (public.sou_admin()) with check (public.sou_admin());

create policy integra_admin on public.integracoes for all  to authenticated
  using (public.sou_admin()) with check (public.sou_admin());

create policy fichas_ler    on public.fichas    for select to authenticated
  using (public.sou_equipe());
create policy fichas_mudar  on public.fichas    for update to authenticated
  using (public.sou_equipe()) with check (public.sou_equipe());
create policy fichas_apagar on public.fichas    for delete to authenticated
  using (public.sou_admin());

create policy envios_admin  on public.envios    for select to authenticated
  using (public.sou_admin());

-- so quem pode decidir muda o status para aprovado/recusado/contraproposta
create or replace function public.trg_ficha_guarda() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status
     and new.status in ('aprovado','contraproposta','recusado')
     and not public.posso_decidir() then
    raise exception 'Somente o administrador aprova ou recusa fichas.'
      using errcode = 'P0001';
  end if;
  -- campos do cliente nao se mexem depois de enviados
  new.protocolo := old.protocolo;
  new.cpf       := old.cpf;
  new.criado_em := old.criado_em;
  if new.status is distinct from old.status
     and new.status in ('aprovado','contraproposta','recusado') then
    new.decidido_em  := now();
    new.decidido_por := coalesce(new.decidido_por, (select nome from public.perfis where id = auth.uid()));
  end if;
  return new;
end $$;

drop trigger if exists ficha_guarda on public.fichas;
create trigger ficha_guarda before update on public.fichas
  for each row execute function public.trg_ficha_guarda();

-- ---------------------------------------------------------------------------
-- 11. PERMISSOES (o link publico so consegue chamar enviar_ficha)
-- ---------------------------------------------------------------------------
revoke all on table public.fichas, public.perfis, public.regras,
                    public.integracoes, public.envios from anon;
revoke all on table public.integracoes from authenticated;
grant  select, update on table public.fichas  to authenticated;
grant  delete         on table public.fichas  to authenticated;
grant  select         on table public.perfis  to authenticated;
grant  select, update on table public.regras  to authenticated;
grant  select, insert, update on table public.integracoes to authenticated;
grant  select         on table public.envios  to authenticated;

revoke execute on function public.enviar_whatsapp(text, text, uuid)  from public, anon, authenticated;
revoke execute on function public.notificar_telegram(text, uuid)     from public, anon, authenticated;
grant  execute on function public.enviar_ficha(jsonb)                to anon, authenticated;
grant  execute on function public.sou_equipe(), public.sou_admin(),
                           public.posso_decidir(), public.meu_perfil() to authenticated;
grant  usage, select on sequence public.protocolo_seq to anon, authenticated;

-- deixa o painel receber ficha nova na hora (tempo real)
do $$ begin
  alter publication supabase_realtime add table public.fichas;
exception when others then null;
end $$;

-- ---------------------------------------------------------------------------
-- 11b. O PAINEL PERGUNTA / TESTA
-- ---------------------------------------------------------------------------
-- o painel usa isso para saber se deve mandar o WhatsApp sozinho
create or replace function public.whatsapp_automatico() returns boolean
language plpgsql stable security definer set search_path = public as $$
declare i public.integracoes;
begin
  if not public.sou_equipe() then return false; end if;
  select * into i from public.integracoes where id = 1;
  if not found then return false; end if;
  return i.enviar_auto and coalesce(i.wa_provider,'') <> '' and coalesce(i.wa_url,'') <> '';
end $$;

-- botao "mandar aviso de teste agora" do painel
create or replace function public.testar_aviso() returns text
language plpgsql security definer set search_path = public as $$
declare ok_tg boolean; ok_wa boolean; i public.integracoes; r text := '';
begin
  if not public.sou_admin() then
    raise exception 'Somente o administrador pode mandar o teste.' using errcode = 'P0001';
  end if;
  select * into i from public.integracoes where id = 1;
  ok_tg := public.notificar_telegram(
    '<b>TESTE - CREDIARIO TECNO CELL</b>' || E'\n' ||
    'Se voce esta lendo isso, o aviso de ficha nova vai funcionar.');
  r := case when ok_tg then 'Telegram: enviado (confira o aplicativo).'
            else 'Telegram: nao configurado - preencha o token e o chat ID.' end;
  if found and i.notificar_admin_wa and coalesce(i.admin_whats,'') <> '' then
    ok_wa := public.enviar_whatsapp(i.admin_whats,
      'TESTE - Crediario Tecno Cell. O aviso de ficha nova esta funcionando.');
    r := r || ' | WhatsApp do dono: ' || case when ok_wa then 'enviado.' else 'falhou (confira URL e token).' end;
  end if;
  return r;
end $$;

grant execute on function public.whatsapp_automatico(), public.testar_aviso() to authenticated;

-- ---------------------------------------------------------------------------
-- 12. CADASTRAR A EQUIPE
--     Antes: Authentication > Users > Add user (marque "Auto Confirm User")
--       alerson@tecnocell.app  /  camila@tecnocell.app  /  andreia@tecnocell.app
--     Depois rode as 3 linhas abaixo:
-- ---------------------------------------------------------------------------
create or replace function public.vincular_perfil(
  p_email text, p_nome text, p_usuario text, p_papel text default 'vendedor')
returns text
language plpgsql security definer set search_path = public, auth as $$
declare v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(p_email);
  if v_id is null then
    return 'NAO ENCONTREI o usuario ' || p_email ||
           '. Crie em Authentication > Users e rode de novo.';
  end if;
  insert into public.perfis (id, nome, usuario, papel, pode_decidir)
  values (v_id, p_nome, lower(p_usuario), p_papel, p_papel = 'admin')
  on conflict (id) do update
    set nome = excluded.nome, usuario = excluded.usuario,
        papel = excluded.papel, pode_decidir = excluded.pode_decidir, ativo = true;
  return 'OK: ' || p_nome || ' (' || p_papel || ')';
end $$;
revoke execute on function public.vincular_perfil(text,text,text,text) from public, anon, authenticated;

select public.vincular_perfil('alerson@tecnocell.app', 'Alerson', 'alerson', 'admin');
select public.vincular_perfil('camila@tecnocell.app',  'Camila',  'camila',  'vendedor');
select public.vincular_perfil('andreia@tecnocell.app', 'Andreia', 'andreia', 'vendedor');
