import type { Metadata, Viewport } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-oswald" });

export const metadata: Metadata = {
  title: "Dados financeiros | V4 Carvalho & Co",
  description: "Formulário de dados financeiros para cálculo de ROI",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={oswald.variable}>
      <body>
        <div className="brand">V4 Carvalho &amp; Co</div>
        {children}
      </body>
    </html>
  );
}
