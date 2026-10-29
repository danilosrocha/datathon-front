import type { AvatarState, Card, CardGroup, FactSource, FactStatus } from "@/lib/api/types";

/** Textos de UI para estados, origens e grupos do contrato. Só apresentação. */

export const STATUS_LABELS: Record<Exclude<FactStatus, "rejeitado">, string> = {
  observado: "Disponível",
  derivado: "Calculado",
  estimado: "Estimado",
  confirmado: "Confirmado",
};

export const SOURCE_LABELS: Record<FactSource, string> = {
  usuario_texto: "Você contou na conversa",
  usuario_resposta: "Você respondeu",
  base_comum: "Base de dados do desafio",
  receita_cnpj: "Receita Federal",
  formula: "Cálculo a partir dos seus dados",
  api_territorio: "Dados públicos do município",
  api_clima: "Histórico de clima da região",
  api_desastres: "Registros de desastres da região",
  api_seguranca: "Dados públicos de segurança",
  grafo: "Negócios parecidos com o seu",
};

export const AVATAR_LABELS: Record<AvatarState, string> = {
  ouvindo: "Ouvindo",
  pensando: "Pensando",
  consultando: "Consultando fontes",
  sorrindo: "Entendi!",
  explicando: "Explicando",
  preocupado: "Atenção",
  comemorando: "Perfil pronto",
};

export interface ProfileSection {
  id: string;
  title: string;
  description: string;
  match: (card: Card) => boolean;
}

const ACTIVITY_KEYS = new Set(["atividade_efetiva", "cnae_principal", "cnaes_secundarios", "porte", "num_empregados_faixa", "faturamento_faixa"]);
const byGroup = (...groups: CardGroup[]) => (card: Card) => groups.includes(card.group);

/** Seções semânticas do perfil. "A confirmar" vem antes e reúne as estimativas. */
export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: "confirmar",
    title: "Para você confirmar",
    description: "Estimativas que dependem da sua confirmação.",
    match: (card) => card.status === "estimado",
  },
  {
    id: "atividade",
    title: "Atividade empresarial",
    description: "O que a empresa faz.",
    match: (card) => card.group === "identificacao" && ACTIVITY_KEYS.has(card.key),
  },
  {
    id: "identificacao",
    title: "Identificação do negócio",
    description: "Nome e dados cadastrais.",
    match: (card) => card.group === "identificacao",
  },
  {
    id: "estrutura",
    title: "Estrutura e operação",
    description: "Local, imóvel e rotina.",
    match: byGroup("local", "operacao"),
  },
  {
    id: "patrimonio",
    title: "Patrimônio e equipamentos",
    description: "Estoque, máquinas e bens.",
    match: byGroup("ativos"),
  },
  {
    id: "continuidade",
    title: "Continuidade e digital",
    description: "Despesas, tempo sem operar e dados.",
    match: byGroup("continuidade", "digital"),
  },
  {
    id: "riscos",
    title: "Riscos da região",
    description: "Estimativas por município.",
    match: byGroup("riscos_regiao"),
  },
];

/** Distribui cada card em uma única seção, na ordem acima. */
export function groupCards(cards: Card[]) {
  const remaining = [...cards];
  return PROFILE_SECTIONS.map((section) => {
    const matched = remaining.filter(section.match);
    for (const card of matched) remaining.splice(remaining.indexOf(card), 1);
    return { section, cards: matched };
  }).filter((entry) => entry.cards.length > 0);
}
