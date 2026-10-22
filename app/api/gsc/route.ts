import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { GSC_MAX_ANSWER, GSC_QUESTION_IDS } from "@/lib/gsc-questions";

export const runtime = "nodejs";

const str = (v: unknown, max: number) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s || null;
};

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Servidor não configurado." }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const respondente_nome = str(body?.respondente_nome, 200);
  if (!respondente_nome) return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });

  const email = str(body?.email, 200);
  if (email && !/^\S+@\S+\.\S+$/.test(email))
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });

  const respostas: Record<string, string> = {};
  for (const id of GSC_QUESTION_IDS) {
    const a = str(body?.respostas?.[id], GSC_MAX_ANSWER);
    if (a) respostas[id] = a;
  }
  if (Object.keys(respostas).length === 0)
    return NextResponse.json({ error: "Responda ao menos uma pergunta." }, { status: 400 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("respostas_gsc").insert({
    respondente_nome,
    cargo: str(body?.cargo, 200),
    email,
    respostas,
  });
  if (error) {
    console.error("supabase insert gsc", error.message);
    return NextResponse.json({ error: "Não foi possível salvar. Tente novamente." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
