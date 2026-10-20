export type Payload = {
  cliente_nome: string;
  empresa: string | null;
  email: string | null;
  faturamento_2025: number;
  pct_custo_produto: number;
  pct_impostos: number;
  pct_comissao: number;
  pct_taxas_pagamento: number;
  pct_frete: number;
  tem_outro_custo: boolean;
  pct_outro_custo: number | null;
  descricao_outro_custo: string | null;
  investimento_marketing_2025: number | null;
  ticket_medio: number | null;
  qtd_vendas_2025: number | null;
  observacoes: string | null;
};

export const PCT_FIELDS = [
  "pct_custo_produto",
  "pct_impostos",
  "pct_comissao",
  "pct_taxas_pagamento",
  "pct_frete",
] as const;

/** Aceita "1.500.000,50", "1500000.5", "R$ 1.500", "12,5" */
export function parseNumber(raw: string): number | null {
  let s = raw.replace(/[^\d.,-]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if ((s.match(/\./g) ?? []).length > 1 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const str = (v: unknown, max: number) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s || null;
};
const num = (v: unknown) =>
  v === null || v === undefined || v === "" ? null : Number.isFinite(Number(v)) ? Number(v) : NaN;

/** Valida o corpo recebido; usada no servidor (fonte de verdade). */
export function validate(body: any): { ok: true; data: Payload } | { ok: false; error: string } {
  const cliente_nome = str(body?.cliente_nome, 200);
  if (!cliente_nome) return { ok: false, error: "Informe o nome do cliente." };

  const email = str(body?.email, 200);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "E-mail inválido." };

  const fat = num(body?.faturamento_2025);
  if (fat === null || Number.isNaN(fat) || fat < 0 || fat > 1e13)
    return { ok: false, error: "Informe um faturamento válido." };

  const pcts: Record<string, number> = {};
  for (const f of PCT_FIELDS) {
    const v = num(body?.[f]);
    if (v === null || Number.isNaN(v) || v < 0 || v > 100)
      return { ok: false, error: "Os percentuais devem estar entre 0 e 100." };
    pcts[f] = v;
  }

  const tem = body?.tem_outro_custo === true;
  let outro: number | null = null;
  if (tem) {
    outro = num(body?.pct_outro_custo);
    if (outro === null || Number.isNaN(outro) || outro < 0 || outro > 100)
      return { ok: false, error: "Informe o percentual do outro custo (0 a 100)." };
  }

  const soma = Object.values(pcts).reduce((a, b) => a + b, 0) + (outro ?? 0);
  if (soma > 100) return { ok: false, error: "A soma dos custos não pode passar de 100% da venda." };

  const opt = (k: string) => {
    const v = num(body?.[k]);
    return v === null || Number.isNaN(v) || v < 0 ? null : v;
  };
  const qtd = opt("qtd_vendas_2025");

  return {
    ok: true,
    data: {
      cliente_nome,
      empresa: str(body?.empresa, 200),
      email,
      faturamento_2025: fat,
      pct_custo_produto: pcts.pct_custo_produto,
      pct_impostos: pcts.pct_impostos,
      pct_comissao: pcts.pct_comissao,
      pct_taxas_pagamento: pcts.pct_taxas_pagamento,
      pct_frete: pcts.pct_frete,
      tem_outro_custo: tem,
      pct_outro_custo: outro,
      descricao_outro_custo: tem ? str(body?.descricao_outro_custo, 300) : null,
      investimento_marketing_2025: opt("investimento_marketing_2025"),
      ticket_medio: opt("ticket_medio"),
      qtd_vendas_2025: qtd === null ? null : Math.round(qtd),
      observacoes: str(body?.observacoes, 2000),
    },
  };
}
