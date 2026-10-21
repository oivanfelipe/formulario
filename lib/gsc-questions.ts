export type GscQuestion = { id: string; n: number; label: string; hint?: string };
export type GscSection = { title: string; questions: GscQuestion[] };

const RAW: { title: string; questions: string[] }[] = [
  {
    title: "Equipe e responsabilidades",
    questions: [
      "Quantas pessoas atuam no comercial e qual a função de cada uma? Quem faz o primeiro atendimento, qualificação, visita, proposta, negociação e fechamento?",
      "Quem participará do treinamento? Qual a experiência dessas pessoas com vendas?",
      "Quem lidera o comercial e acompanha a rotina da equipe?",
      "Como funciona a passagem dos contatos entre os responsáveis? Quem acompanha cada oportunidade até o fechamento?",
    ],
  },
  {
    title: "Entrada e tratamento dos leads",
    questions: [
      "Quem atende os interessados também realiza prospecção ativa? Utilizam abordagens diferentes?",
      "Quanto tempo levam para realizar o primeiro atendimento? Como tratam os contatos que chegam fora do horário comercial?",
      "Quais perguntas costumam fazer antes de oferecer uma visita?",
      "Como identificam quem toma a decisão de compra e se existe necessidade de aprovação de terceiros ou assembleia?",
      "Como tratam contatos fora da região atendida, fornecedores, currículos e pessoas que buscam apenas informações?",
    ],
  },
  {
    title: "CRM e organização comercial",
    questions: [
      "Quais etapas existem atualmente no funil comercial do CRM?",
      "Quais informações são registradas no CRM? A equipe mantém histórico de atendimento, necessidade do cliente, solução de interesse, responsável e próxima ação?",
      "Os atendimentos são realizados pelo WhatsApp da empresa ou por números individuais? Os responsáveis conseguem consultar o histórico?",
      "Existe uma rotina para revisar leads novos, retornos atrasados e propostas paradas?",
    ],
  },
  {
    title: "Abordagem e diagnóstico",
    questions: [
      "Existem scripts ou orientações comerciais que a equipe já utiliza?",
      "Como respondem quando o interessado deseja entender as soluções, marcas ou funcionamento antes de aceitar uma visita?",
      "Quais necessidades e dúvidas aparecem com mais frequência em cada público?",
      "Quais diferenciais a equipe costuma apresentar? Existe dificuldade em demonstrar o valor do serviço além dos equipamentos?",
    ],
  },
  {
    title: "Propostas e negociação",
    questions: [
      "Quem prepara as propostas e quanto tempo leva para enviá-las após a visita?",
      "A proposta é apenas encaminhada ou alguém apresenta e explica o projeto? Conseguem compartilhar um modelo atual?",
      "Quais objeções aparecem com mais frequência e como a equipe responde? Por exemplo: preço, fornecedor atual, contrato, migração, tecnologia ou aprovação de terceiros.",
      "Quais condições podem ser negociadas? Quem aprova descontos, parcelamentos ou benefícios?",
      "Quando uma administradora solicita um orçamento para repassar ao síndico, como a equipe procura participar da apresentação ou apoiar a decisão?",
    ],
  },
  {
    title: "Follow-up e fechamento",
    questions: [
      "Qual é a sequência atual de contatos? Quantas tentativas são realizadas, em quais intervalos e por quais canais?",
      "O acompanhamento muda conforme a situação do cliente, como ausência de resposta, avaliação de proposta ou aprovação em assembleia?",
      "O que costumam enviar nos follow-ups além de perguntar se o cliente visualizou a mensagem ou tomou uma decisão?",
      "Costumam combinar o próximo passo e a data de retorno com o cliente? Como confirmam visitas e retomam cancelamentos?",
      "Quando deixam de insistir, mantêm a oportunidade em acompanhamento futuro ou registram como perdida?",
      "Como acompanham propostas antigas e oportunidades que ficam meses sem decisão?",
      "Quais são os motivos de perda mais comuns? Essas informações são registradas no CRM?",
    ],
  },
  {
    title: "Informações comerciais e pós-venda",
    questions: [
      "Existem valores ou faixas de investimento atualizados e aprovados para informar durante o atendimento? Quais condições contratuais precisam ser explicadas?",
      "Como acontece a passagem do cliente do comercial para a equipe de instalação e monitoramento após a venda?",
      "Existem ações de reativação, oferta de novos serviços para a base e relacionamento com instaladores parceiros?",
      "A equipe utiliza alguma ferramenta de inteligência artificial? Seria útil receber orientações ou prompts para apoiar abordagens e follow-ups?",
    ],
  },
];

let counter = 0;
export const GSC_SECTIONS: GscSection[] = RAW.map((s) => ({
  title: s.title,
  questions: s.questions.map((label) => {
    counter += 1;
    return { id: `q${String(counter).padStart(2, "0")}`, n: counter, label };
  }),
}));

export const GSC_QUESTION_IDS = GSC_SECTIONS.flatMap((s) => s.questions.map((q) => q.id));
export const GSC_MAX_ANSWER = 4000;
