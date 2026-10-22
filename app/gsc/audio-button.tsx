"use client";

import { useEffect, useRef, useState } from "react";

const MAX_SECONDS = 240;
const MIMES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

type State = "idle" | "rec" | "busy";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Grava a voz, transcreve no servidor e entrega o texto para o campo da resposta. */
export default function AudioButton({
  disabled,
  onText,
  onBusy,
}: {
  disabled?: boolean;
  onText: (text: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [secs, setSecs] = useState(0);
  const [msg, setMsg] = useState("");
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSupported(typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia);
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (rec.current && rec.current.state !== "inactive") {
        rec.current.onstop = null;
        rec.current.stop();
        rec.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (!supported) return null;

  const set = (s: State) => {
    setState(s);
    onBusy(s !== "idle");
  };

  async function transcribe(blob: Blob, ext: string) {
    set("busy");
    try {
      const fd = new FormData();
      fd.append("audio", blob, `audio.${ext}`);
      const r = await fetch("/api/transcrever", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Não foi possível transcrever. Digite sua resposta.");
      onText(j.text);
      setMsg("Texto adicionado. Pode editar se quiser.");
    } catch (e: any) {
      setMsg(e.message || "Não foi possível transcrever. Digite sua resposta.");
    }
    set("idle");
  }

  async function start() {
    setMsg("");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMsg("Não consegui acessar o microfone. Libere a permissão no navegador ou digite sua resposta.");
      return;
    }
    const mime = MIMES.find((m) => MediaRecorder.isTypeSupported(m));
    const ext = mime?.includes("mp4") ? "m4a" : mime?.includes("ogg") ? "ogg" : "webm";
    const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (timer.current) clearInterval(timer.current);
      const blob = new Blob(chunks, { type: r.mimeType || mime || "audio/webm" });
      if (blob.size < 1500) {
        setMsg("Não ouvi nada. Tente de novo.");
        set("idle");
        return;
      }
      transcribe(blob, ext);
    };
    rec.current = r;
    r.start();
    setSecs(0);
    set("rec");
    timer.current = setInterval(() => {
      setSecs((s) => {
        if (s + 1 >= MAX_SECONDS) r.state !== "inactive" && r.stop();
        return s + 1;
      });
    }, 1000);
  }

  const stop = () => rec.current && rec.current.state !== "inactive" && rec.current.stop();

  return (
    <div className="audio">
      {state === "rec" ? (
        <button type="button" className="mic rec" onClick={stop}>
          <span className="dot" /> Parar e enviar ({fmt(secs)})
        </button>
      ) : (
        <button type="button" className="mic" onClick={start} disabled={disabled || state === "busy"}>
          <span className="dot" /> {state === "busy" ? "Transcrevendo…" : "Responder por áudio"}
        </button>
      )}
      {msg && <span className={msg.startsWith("Texto") ? "audio-msg" : "audio-msg err"} role="status">{msg}</span>}
    </div>
  );
}
