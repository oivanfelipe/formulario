import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Limite do corpo de uma função na Vercel é 4,5 MB; ~4 min de áudio comprimido cabem folgados.
const MAX_BYTES = 4 * 1024 * 1024;
const VOCAB =
  "Diagnóstico comercial de empresa de segurança eletrônica: CRM, funil, leads, follow-up, proposta, síndico, administradora, assembleia, instalação, monitoramento, WhatsApp.";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return fail("Transcrição por áudio indisponível no momento. Digite sua resposta.", 503);

  // só aceita chamadas feitas pela própria página (evita uso da chave por terceiros)
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return fail("Origem não permitida.", 403);
    } catch {
      return fail("Origem não permitida.", 403);
    }
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Requisição inválida.", 400);
  }
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size === 0) return fail("Áudio inválido.", 400);
  if (audio.size > MAX_BYTES) return fail("Áudio muito longo. Grave em trechos menores.", 413);

  const out = new FormData();
  out.append("file", audio, audio.name || "audio.webm");
  out.append("model", "whisper-large-v3-turbo");
  out.append("language", "pt");
  out.append("temperature", "0");
  out.append("response_format", "json");
  out.append("prompt", VOCAB);

  let r: Response;
  try {
    r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: out,
    });
  } catch (e) {
    console.error("groq fetch", e instanceof Error ? e.message : e);
    return fail("Não foi possível transcrever agora. Tente de novo ou digite.", 502);
  }
  if (!r.ok) {
    console.error("groq", r.status, (await r.text().catch(() => "")).slice(0, 300));
    return fail("Não foi possível transcrever agora. Tente de novo ou digite.", 502);
  }

  const j = (await r.json().catch(() => ({}))) as { text?: unknown };
  const text = typeof j.text === "string" ? j.text.trim() : "";
  if (!text) return fail("Não entendi o áudio. Tente falar mais perto do microfone.", 422);
  return NextResponse.json({ text });
}
