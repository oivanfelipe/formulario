create table if not exists public.respostas_financeiras (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  cliente_nome text not null,
  empresa text,
  email text,

  faturamento_2025 numeric(16,2) not null check (faturamento_2025 >= 0),
  pct_custo_produto numeric(5,2) not null check (pct_custo_produto between 0 and 100),
  pct_impostos numeric(5,2) not null check (pct_impostos between 0 and 100),
  pct_comissao numeric(5,2) not null check (pct_comissao between 0 and 100),
  pct_taxas_pagamento numeric(5,2) not null check (pct_taxas_pagamento between 0 and 100),
  pct_frete numeric(5,2) not null check (pct_frete between 0 and 100),
  tem_outro_custo boolean not null default false,
  pct_outro_custo numeric(5,2) check (pct_outro_custo between 0 and 100),
  descricao_outro_custo text,

  -- opcionais que refinam o ROI
  investimento_marketing_2025 numeric(16,2) check (investimento_marketing_2025 >= 0),
  ticket_medio numeric(16,2) check (ticket_medio >= 0),
  qtd_vendas_2025 integer check (qtd_vendas_2025 >= 0),
  observacoes text,

  -- calculado: 100 - soma dos custos variáveis
  margem_contribuicao_pct numeric(6,2) generated always as (
    100 - (pct_custo_produto + pct_impostos + pct_comissao + pct_taxas_pagamento
           + pct_frete + coalesce(pct_outro_custo, 0))
  ) stored,

  constraint outro_custo_coerente check (tem_outro_custo = false or pct_outro_custo is not null)
);

create index if not exists respostas_financeiras_cliente_idx
  on public.respostas_financeiras (cliente_nome, created_at desc);

-- RLS ligado e sem policies: só o servidor (service_role) lê/escreve.
alter table public.respostas_financeiras enable row level security;
