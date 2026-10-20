import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { validate } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Servidor não configurado." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  // honeypot anti-bot: campo escondido que humanos não preenchem
  if ((body as any)?.website) return NextResponse.json({ ok: true });

  const result = validate(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("respostas_financeiras").insert(result.data);
  if (error) {
    console.error("supabase insert", error.message);
    return NextResponse.json({ error: "Não foi possível salvar. Tente novamente." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
