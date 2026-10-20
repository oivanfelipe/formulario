-- Formulário público: a chave publishable só pode INSERIR (sem select/update/delete).
create policy "form_insert_only" on public.respostas_financeiras
  for insert to anon
  with check (
    char_length(cliente_nome) between 1 and 200
    and (empresa is null or char_length(empresa) <= 200)
    and (email is null or char_length(email) <= 200)
    and (descricao_outro_custo is null or char_length(descricao_outro_custo) <= 300)
    and (observacoes is null or char_length(observacoes) <= 2000)
  );
grant insert on public.respostas_financeiras to anon;
