"use client";

import { useEffect, useState } from "react";
import { GSC_MAX_ANSWER, GSC_SECTIONS } from "@/lib/gsc-questions";

const STEPS = ["Identificação", ...GSC_SECTIONS.map((s) => s.title)];
const DRAFT_KEY = "gsc-diagnostico-v1";

type Draft = { nome: string; cargo: string; email: string; respostas: Record<string, string> };
const EMPTY: Draft = { nome: "", cargo: "", email: "", respostas: {} };

export default function Page() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(EMPTY);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // questionário longo: recupera o rascunho se a pessoa fechar a página no meio
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setD({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch {}
  }, [d, loaded]);

  const setAnswer = (id: string, v: string) => setD((p) => ({ ...p, respostas: { ...p.respostas, [id]: v } }));
  const last = step === STEPS.length - 1;
  const section = step > 0 ? GSC_SECTIONS[step - 1] : null;

  function validateStep(): string {
    if (step === 0) {
      if (!d.nome.trim()) return "Informe seu nome.";
      if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) return "E-mail inválido.";
    }
    return "";
  }

  function go(to: number) {
    setErr("");
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() {
    const e = validateStep();
    if (e) return setErr(e);
    go(step + 1);
  }

  async function submit() {
    if (!Object.values(d.respostas).some((v) => v?.trim())) return setErr("Responda ao menos uma pergunta antes de enviar.");
    setSending(true);
    setErr("");
    try {
      const r = await fetch("/api/gsc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondente_nome: d.nome,
          cargo: d.cargo,
          email: d.email,
          respostas: d.respostas,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Erro ao enviar.");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      window.location.href = "/gsc/obrigado";
    } catch (e: any) {
      setErr(e.message);
      setSending(false);
    }
  }

  const answered = Object.values(d.respostas).filter((v) => v?.trim()).length;
  const total = GSC_SECTIONS.reduce((a, s) => a + s.questions.length, 0);

  return (
    <main className="wrap">
      <header>
        <p className="eyebrow">0{step + 1} {STEPS[step]}</p>
        <div className="bar" aria-hidden>
          <div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <p className="muted small">
          Passo {step + 1} de {STEPS.length}. Pode responder do seu jeito, com exemplos reais. Se não souber algo, escreva “não sei” ou “não temos”.
        </p>
      </header>

      <div className="card">
        {step === 0 && (
          <>
            <h1>Diagnóstico comercial</h1>
            <p className="muted lead">
              Estas perguntas ajudam a entender como o comercial funciona hoje, para montar o treinamento e os materiais sob medida para a equipe. Suas respostas são salvas neste aparelho enquanto você preenche.
            </p>
            <label className="field">
              <span className="q">Seu nome *</span>
              <input value={d.nome} onChange={(e) => setD({ ...d, nome: e.target.value })} autoComplete="name" />
            </label>
            <label className="field">
              <span className="q">Cargo ou função</span>
              <input value={d.cargo} onChange={(e) => setD({ ...d, cargo: e.target.value })} autoComplete="organization-title" />
            </label>
            <label className="field">
              <span className="q">E-mail para contato</span>
              <span className="hint">Opcional. Usaremos só se precisarmos tirar uma dúvida.</span>
              <input type="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} autoComplete="email" />
            </label>
          </>
        )}

        {section && (
          <>
            <h1>{section.title}</h1>
            {section.questions.map((q) => (
              <label className="field" key={q.id}>
                <span className="q">{q.n}. {q.label}</span>
                <textarea
                  rows={4}
                  maxLength={GSC_MAX_ANSWER}
                  value={d.respostas[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              </label>
            ))}
            {last && <p className="hint">{answered} de {total} perguntas respondidas. Dá para voltar e completar antes de enviar.</p>}
          </>
        )}

        {err && <p className="error" role="alert">{err}</p>}

        <div className="nav">
          {step > 0 ? <button type="button" className="ghost" onClick={() => go(step - 1)}>Voltar</button> : <span />}
          {!last ? (
            <button type="button" className="primary" onClick={next}>Continuar</button>
          ) : (
            <button type="button" className="primary" disabled={sending} onClick={submit}>{sending ? "Enviando…" : "Enviar respostas"}</button>
          )}
        </div>
      </div>
    </main>
  );
}
