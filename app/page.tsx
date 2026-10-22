"use client";

import { useEffect, useMemo, useState } from "react";
import { PCT_FIELDS, parseNumber } from "@/lib/validate";

type Form = Record<string, string> & { tem_outro_custo: "" | "nao" | "sim" };

const PCT_QUESTIONS: { name: (typeof PCT_FIELDS)[number]; n: number; label: string; hint?: string }[] = [
  {
    name: "pct_custo_produto",
    n: 2,
    label: "Em média, qual percentual do valor de uma venda é gasto com o produto ou serviço vendido?",
    hint: "Considere o custo para comprar, produzir ou executar o que foi vendido.",
  },
  {
    name: "pct_impostos",
    n: 3,
    label: "Em média, qual percentual das vendas é pago em impostos?",
  },
  {
    name: "pct_comissao",
    n: 4,
    label: "Em média, qual percentual das vendas é pago em comissão para vendedores, representantes ou parceiros?",
  },
  {
    name: "pct_taxas_pagamento",
    n: 5,
    label: "Em média, qual percentual das vendas é gasto com taxas de cartão, gateway ou outros meios de pagamento?",
  },
  {
    name: "pct_frete",
    n: 6,
    label: "Em média, qual percentual das vendas é gasto com frete ou entrega pago pela empresa?",
  },
];

const SHORT: Record<(typeof PCT_FIELDS)[number], string> = {
  pct_custo_produto: "Custo do produto ou serviço",
  pct_impostos: "Impostos",
  pct_comissao: "Comissões",
  pct_taxas_pagamento: "Taxas de pagamento",
  pct_frete: "Frete e entrega",
};

const STEPS = ["Identificação", "Faturamento e custos", "Outros custos", "Revisão"];
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Page() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>({ tem_outro_custo: "" } as Form);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  // link personalizado: /?cliente=Nome%20da%20Empresa
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("cliente");
    if (c) setF((p) => ({ ...p, cliente_nome: c }));
  }, []);

  const pct = (k: string) => parseNumber(f[k] ?? "");
  const fat = parseNumber(f.faturamento_2025 ?? "");
  const outro = f.tem_outro_custo === "sim" ? pct("pct_outro_custo") ?? 0 : 0;
  const custos = PCT_FIELDS.reduce((a, k) => a + (pct(k) ?? 0), 0) + outro;
  const margem = 100 - custos;

  const missingPct = PCT_FIELDS.some((k) => pct(k) === null);

  function validateStep(s: number): string {
    if (s === 0 && !f.cliente_nome?.trim()) return "Informe o nome do cliente.";
    if (s === 0 && f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return "E-mail inválido.";
    if (s === 1) {
      if (fat === null || fat < 0) return "Informe o faturamento de 2025.";
      if (missingPct) return "Preencha todos os percentuais (use 0 se não houver o custo).";
      if (PCT_FIELDS.some((k) => (pct(k) as number) > 100)) return "Percentuais devem ficar entre 0 e 100.";
    }
    if (s === 2) {
      if (!f.tem_outro_custo) return "Escolha Sim ou Não.";
      if (f.tem_outro_custo === "sim") {
        const o = pct("pct_outro_custo");
        if (o === null || o < 0 || o > 100) return "Informe o percentual do outro custo (0 a 100).";
      }
      if (custos > 100) return "A soma dos custos passou de 100% da venda. Revise os percentuais.";
    }
    return "";
  }

  function next() {
    const e = validateStep(step);
    setErr(e);
    if (!e) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function submit() {
    setSending(true);
    setErr("");
    const optNum = (k: string) => parseNumber(f[k] ?? "");
    const body = {
      cliente_nome: f.cliente_nome,
      empresa: f.empresa,
      email: f.email,
      faturamento_2025: fat,
      ...Object.fromEntries(PCT_FIELDS.map((k) => [k, pct(k)])),
      tem_outro_custo: f.tem_outro_custo === "sim",
      pct_outro_custo: f.tem_outro_custo === "sim" ? pct("pct_outro_custo") : null,
      descricao_outro_custo: f.descricao_outro_custo,
      investimento_marketing_2025: optNum("investimento_marketing_2025"),
      ticket_medio: optNum("ticket_medio"),
      qtd_vendas_2025: optNum("qtd_vendas_2025"),
      observacoes: f.observacoes,
    };
    try {
      const r = await fetch("/api/respostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Erro ao enviar.");
      window.location.href = "/obrigado";
    } catch (e: any) {
      setErr(e.message);
      setSending(false);
    }
  }

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  return (
    <main className="wrap">
      <header>
        <p className="eyebrow">0{step + 1} {STEPS[step]}</p>
        <div className="bar" aria-hidden>
          <div style={{ width: `${progress}%` }} />
        </div>
        <p className="muted small">
          Passo {step + 1} de {STEPS.length}. Leva cerca de 3 minutos e valores aproximados já ajudam.
        </p>
      </header>

      <div className="card">
        {step === 0 && (
          <>
            <h1>Vamos começar</h1>
            <Field label="Nome do cliente *">
              <input value={f.cliente_nome ?? ""} onChange={(e) => set("cliente_nome", e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Empresa" hint="Se for diferente do nome do cliente.">
              <input value={f.empresa ?? ""} onChange={(e) => set("empresa", e.target.value)} autoComplete="organization" />
            </Field>
            <Field label="E-mail para contato" hint="Opcional. Usaremos só se precisarmos tirar uma dúvida.">
              <input type="email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <h1>Faturamento e custos por venda</h1>
            <Field label="1. Qual foi o faturamento total da empresa em 2025?">
              <div className="affix">
                <span>R$</span>
                <input inputMode="decimal" placeholder="0,00" value={f.faturamento_2025 ?? ""} onChange={(e) => set("faturamento_2025", e.target.value)} onBlur={() => fat !== null && set("faturamento_2025", fat.toLocaleString("pt-BR", { minimumFractionDigits: 2 }))} />
              </div>
            </Field>
            {PCT_QUESTIONS.map((q) => (
              <Field key={q.name} label={`${q.n}. ${q.label}`} hint={q.hint}>
                <Pct value={f[q.name] ?? ""} onChange={(v) => set(q.name, v)} />
              </Field>
            ))}
            <p className="hint">Se a empresa não tem algum desses custos, digite 0.</p>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Outros custos</h1>
            <Field label="7. Existe algum outro custo que aumenta conforme a empresa realiza mais vendas?">
              <div className="choices">
                {(["nao", "sim"] as const).map((v) => (
                  <button type="button" key={v} className={f.tem_outro_custo === v ? "choice on" : "choice"} onClick={() => set("tem_outro_custo", v)}>
                    {v === "sim" ? "Sim" : "Não"}
                  </button>
                ))}
              </div>
            </Field>
            {f.tem_outro_custo === "sim" && (
              <>
                <Field label="8. Qual percentual das vendas esse custo representa, aproximadamente?">
                  <Pct value={f.pct_outro_custo ?? ""} onChange={(v) => set("pct_outro_custo", v)} />
                </Field>
                <Field label="Que custo é esse?" hint="Opcional. Ex.: embalagem, royalties, licenças, plataforma.">
                  <input value={f.descricao_outro_custo ?? ""} onChange={(e) => set("descricao_outro_custo", e.target.value)} />
                </Field>
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h1>Revise e envie</h1>
            <div className="summary">
              <Row k="Cliente" v={f.cliente_nome} />
              <Row k="Faturamento 2025" v={fat !== null ? brl(fat) : "Não informado"} />
              {PCT_QUESTIONS.map((q) => (
                <Row key={q.name} k={SHORT[q.name]} v={`${pct(q.name) ?? 0}%`} small />
              ))}
              {f.tem_outro_custo === "sim" && <Row k={f.descricao_outro_custo || "Outro custo variável"} v={`${outro}%`} />}
              <div className="margin">
                <span>Sobra de cada venda (margem de contribuição)</span>
                <strong className={margem < 0 ? "neg" : ""}>{margem.toFixed(1).replace(".", ",")}%</strong>
                {fat !== null && <small>≈ {brl((fat * margem) / 100)} em 2025</small>}
              </div>
            </div>

            <h2>Ajuda a refinar o ROI <span className="tag">// OPCIONAL</span></h2>
            <Field label="Quanto a empresa investiu em marketing e vendas em 2025?" hint="Mídia paga, agência, ferramentas, equipe comercial.">
              <div className="affix"><span>R$</span><input inputMode="decimal" placeholder="0,00" value={f.investimento_marketing_2025 ?? ""} onChange={(e) => set("investimento_marketing_2025", e.target.value)} /></div>
            </Field>
            <div className="two">
              <Field label="Ticket médio">
                <div className="affix"><span>R$</span><input inputMode="decimal" value={f.ticket_medio ?? ""} onChange={(e) => set("ticket_medio", e.target.value)} /></div>
              </Field>
              <Field label="Nº de vendas em 2025">
                <input inputMode="numeric" value={f.qtd_vendas_2025 ?? ""} onChange={(e) => set("qtd_vendas_2025", e.target.value)} />
              </Field>
            </div>
            <Field label="Alguma observação?">
              <textarea rows={3} value={f.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)} />
            </Field>
          </>
        )}

        {err && <p className="error" role="alert">{err}</p>}

        <div className="nav">
          {step > 0 ? (
            <button type="button" className="ghost" onClick={() => { setErr(""); setStep(step - 1); }}>Voltar</button>
          ) : <span />}
          {step < STEPS.length - 1 ? (
            <button type="button" className="primary" onClick={next}>Continuar</button>
          ) : (
            <button type="button" className="primary" disabled={sending} onClick={submit}>{sending ? "Enviando…" : "Enviar respostas"}</button>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="q">{label}</span>
      {hint && <span className="hint">{hint}</span>}
      {children}
    </label>
  );
}

function Pct({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="affix right">
      <input inputMode="decimal" placeholder="0" value={value} onChange={(e) => onChange(e.target.value)} />
      <span>%</span>
    </div>
  );
}

function Row({ k, v, small }: { k: string; v?: string; small?: boolean }) {
  return (
    <div className={small ? "row small" : "row"}>
      <span>{k}</span>
      <b>{v || "Não informado"}</b>
    </div>
  );
}
