# Formulário — Dados financeiros (cálculo de ROI)

Next.js + Supabase. Formulário em 4 passos; grava em `respostas_financeiras`.

## Setup
1. No Supabase, rode as migrations em `supabase/migrations/` (já aplicadas no projeto dashboard-v4).
2. Copie `.env.example` para `.env.local` e preencha `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`.
3. `npm install && npm run dev`

## Deploy na Vercel
Importe o repositório e cadastre as mesmas variáveis em Settings → Environment Variables.

## Link personalizado por cliente
`https://seu-dominio.vercel.app/?cliente=Nome%20do%20Cliente` já preenche o nome.

## Segurança
RLS ligado: a chave publishable só pode INSERIR em `respostas_financeiras` (policy `form_insert_only`); ninguém consegue ler as respostas com ela. Se `SUPABASE_SERVICE_ROLE_KEY` for definida, ela é usada no lugar (nunca no navegador).
