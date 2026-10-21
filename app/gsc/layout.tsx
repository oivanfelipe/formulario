import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnóstico comercial | V4 Carvalho & Co",
  description: "Questionário de diagnóstico comercial",
  robots: { index: false, follow: false },
};

export default function GscLayout({ children }: { children: React.ReactNode }) {
  return children;
}
