# Formulário — Dados financeiros (cálculo de ROI)

Next.js + Supabase. Formulário em 4 passos; grava em `respostas_financeiras`.

## Setup
1. No Supabase, rode `supabase/migrations/001_respostas_financeiras.sql` (SQL Editor).
2. Copie `.env.example` para `.env.local` e preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. `npm install && npm run dev`

## Deploy na Vercel
Importe o repositório e cadastre as mesmas duas variáveis em Settings → Environment Variables.

## Link personalizado por cliente
`https://seu-dominio.vercel.app/?cliente=Nome%20do%20Cliente` já preenche o nome.

## Segurança
A tabela tem RLS ligado e sem policies; apenas a rota `/api/respostas` (service role, servidor) escreve.
A chave nunca vai ao navegador.
