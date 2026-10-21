-- Diagnóstico comercial (cliente GSC): respostas abertas guardadas em jsonb { "q01": "...", ... }
create table if not exists public.respostas_gsc (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  respondente_nome text not null,
  cargo text,
  email text,
  respostas jsonb not null default '{}'::jsonb,
  constraint respostas_gsc_objeto check (jsonb_typeof(respostas) = 'object')
);

create index if not exists respostas_gsc_created_idx on public.respostas_gsc (created_at desc);

-- RLS ligado: a chave publishable só pode INSERIR (sem select/update/delete).
alter table public.respostas_gsc enable row level security;
create policy "form_gsc_insert_only" on public.respostas_gsc
  for insert to anon
  with check (
    char_length(respondente_nome) between 1 and 200
    and (cargo is null or char_length(cargo) <= 200)
    and (email is null or char_length(email) <= 200)
    and pg_column_size(respostas) <= 200000
  );
grant insert on public.respostas_gsc to anon;
