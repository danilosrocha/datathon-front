import type { Card, CardGroup, Eligibility, FactSource, FactStatus, FactValue, InputSpec, NeedPriority, Question } from "@/lib/api/types";
import { MONEY_RANGE_OPTIONS } from "@/lib/format";

/*
 * Roteiro GRAVADO do modo demonstração. Só reproduz eventos do contrato
 * (CONTRATOS_API §7) para validar a jornada sem backend. Nada aqui decide
 * elegibilidade, plano ou cobertura de um caso real — isso é do motor de regras.
 */

export interface ScriptContext {
  answers: Record<string, FactValue>;
  say(text: string): Promise<void>;
  patch(cards: Card[]): void;
  avatar(state: "ouvindo" | "pensando" | "consultando" | "sorrindo" | "explicando" | "preocupado" | "comemorando"): void;
  enrich(source: string, detail: string, run: () => Promise<void>): Promise<void>;
  eligibility(value: Eligibility): void;
  wait(ms: number): Promise<void>;
}

export interface ScriptStep {
  question: Question;
  label: string;
  group: CardGroup;
  importance?: NeedPriority;
  when?: (answers: Record<string, FactValue>) => boolean;
  /** Reação depois que a resposta vira card confirmado. */
  after?: (value: FactValue, ctx: ScriptContext) => Promise<void>;
  /** Encerra o roteiro (ex.: impedimento confirmado). */
  stop?: (value: FactValue) => boolean;
}

export function makeCard(
  key: string,
  label: string,
  group: CardGroup,
  value: FactValue,
  display: string,
  status: FactStatus,
  source: FactSource,
  extra: Partial<Pick<Card, "confidence" | "evidence" | "importance" | "editable">> = {},
): Card {
  return {
    key,
    label,
    group,
    value,
    display_value: display,
    status,
    source,
    confidence: extra.confidence ?? (status === "confirmado" ? 1 : 0.6),
    evidence: extra.evidence ?? null,
    importance: extra.importance ?? "media",
    editable: extra.editable ?? null,
    updated_at: new Date().toISOString(),
  };
}

const YES_NO: InputSpec = { type: "boolean" };

const ACTIVITY_OPTIONS = [
  { value: "alimentacao", label: "Restaurante, padaria ou lanchonete" },
  { value: "comercio", label: "Loja ou comércio" },
  { value: "escritorio", label: "Escritório" },
  { value: "servicos", label: "Prestação de serviços" },
  { value: "outra", label: "Outra atividade" },
];

const ACTIVITY_LINES: Record<string, string> = {
  alimentacao:
    "Ótimo! Em negócios de alimentação, equipamentos de cozinha e mercadorias refrigeradas costumam pesar bastante. Vou levar isso em conta.",
  comercio: "Entendi! Numa loja, o estoque e a vitrine costumam ser boa parte do patrimônio. Vou considerar isso.",
  escritorio: "Certo! Em escritórios, equipamentos eletrônicos e dados de clientes costumam ser o mais sensível.",
  servicos: "Legal! Em serviços, as ferramentas de trabalho e o atendimento no local fazem diferença.",
  outra: "Combinado! Vou fazer perguntas gerais e você me conta o que for diferente no seu caso.",
};

// Prefixo do CEP → município de exemplo (só na demonstração; o real vem da api_territorio).
const CEP_REGION: [RegExp, string][] = [
  [/^[01]/, "São Paulo (SP)"],
  [/^2/, "Rio de Janeiro (RJ)"],
  [/^3/, "Belo Horizonte (MG)"],
  [/^4/, "Salvador (BA)"],
  [/^5/, "Recife (PE)"],
  [/^6/, "Fortaleza (CE)"],
  [/^7/, "Brasília (DF)"],
  [/^8/, "Curitiba (PR)"],
  [/^9/, "Porto Alegre (RS)"],
];

export const GREETING =
  "Olá! Vou fazer algumas perguntas para entender como a sua empresa funciona. Tudo o que eu entender aparece no seu perfil, e você pode corrigir quando quiser.";

export const STEPS: ScriptStep[] = [
  {
    label: "Atividade",
    group: "identificacao",
    importance: "alta",
    question: {
      question_id: "q_atividade",
      fact_key: "atividade_efetiva",
      prompt: "Para começar: qual é a atividade principal do seu negócio?",
      style: "aberta",
      input: { type: "select", options: ACTIVITY_OPTIONS },
      reason: "A atividade muda quais riscos e proteções fazem sentido para a sua empresa.",
    },
    after: async (value, ctx) => {
      ctx.avatar("sorrindo");
      await ctx.say(ACTIVITY_LINES[String(value)] ?? ACTIVITY_LINES.outra);
    },
  },
  {
    label: "Nome da empresa",
    group: "identificacao",
    importance: "baixa",
    question: {
      question_id: "q_nome",
      fact_key: "razao_social",
      prompt: "Como se chama a empresa?",
      style: "aberta",
      input: { type: "text" },
      reason: "Usamos o nome só para identificar o seu perfil nesta conversa.",
    },
    after: async (value, ctx) => {
      await ctx.say(`Prazer, ${String(value)}! Registrei o nome no seu perfil.`);
    },
  },
  {
    label: "CEP do estabelecimento",
    group: "local",
    importance: "media",
    question: {
      question_id: "q_cep",
      fact_key: "cep",
      prompt: "Qual é o CEP do estabelecimento?",
      style: "aberta",
      input: { type: "cep" },
      reason: "Pelo município, consultamos o histórico de clima e de eventos da região.",
    },
    after: async (value, ctx) => {
      const cep = String(value).replace(/\D/g, "");
      const city = CEP_REGION.find(([pattern]) => pattern.test(cep))?.[1] ?? "Município de demonstração";
      await ctx.enrich("api_territorio", "Identificando o município pelo CEP…", async () => {
        await ctx.wait(700);
        ctx.patch([
          makeCard("municipio_ibge", "Município", "local", city, city, "observado", "api_territorio", {
            confidence: 0.9,
            evidence: "Identificado pelo CEP (simulado no modo demonstração).",
          }),
        ]);
      });
      await ctx.enrich("api_clima", "Consultando o histórico de clima da sua região…", async () => {
        await ctx.wait(1100);
        ctx.patch([
          makeCard("risco_vendaval_regiao", "Vendaval na região", "riscos_regiao", "medio", "Médio", "estimado", "api_clima", {
            confidence: 0.55,
            importance: "media",
            evidence: "Estimado pelo histórico de eventos do município (simulado).",
          }),
          makeCard("risco_alagamento_regiao", "Alagamento na região", "riscos_regiao", "baixo", "Baixo", "estimado", "api_desastres", {
            confidence: 0.5,
            importance: "baixa",
            evidence: "Estimado pelo registro de desastres do município (simulado).",
          }),
        ]);
      });
      ctx.avatar("explicando");
      await ctx.say(
        "Consultei o histórico de clima do município. São estimativas por região, então aparecem como “Estimado” no seu perfil.",
      );
      ctx.eligibility({
        status: "pendente",
        blockers: [],
        pending: [{ fact_key: "imovel_em_obra", rule_id: "ELG-004", why: "Precisamos confirmar se o imóvel está em obra." }],
        redirect_to: null,
      });
    },
  },
  {
    label: "Relação com o imóvel",
    group: "local",
    question: {
      question_id: "q_imovel",
      fact_key: "relacao_imovel",
      prompt: "O imóvel do negócio é próprio ou alugado?",
      style: "aberta",
      input: {
        type: "select",
        options: [
          { value: "proprietario", label: "Próprio" },
          { value: "inquilino", label: "Alugado" },
        ],
      },
      reason: "Define se faz sentido proteger o prédio, só o conteúdo ou o aluguel.",
    },
    after: async (value, ctx) => {
      if (value === "inquilino") {
        await ctx.say("Anotado! Para imóveis alugados, coberturas de perda ou pagamento de aluguel fazem muito sentido.");
      } else {
        await ctx.say("Perfeito! Sendo próprio, a proteção estrutural do prédio e dos bens ganha destaque.");
      }
    },
  },
  {
    label: "Imóvel em obra",
    group: "local",
    importance: "alta",
    question: {
      question_id: "q_obra",
      fact_key: "imovel_em_obra",
      prompt: "O imóvel está passando por obra, reforma ou construção?",
      style: "confirmacao",
      input: YES_NO,
      reason: "Imóveis em obra têm regras específicas de aceitação no Seguro Empresarial.",
    },
    stop: (value) => value === true,
    after: async (value, ctx) => {
      if (value === true) {
        ctx.avatar("preocupado");
        ctx.eligibility({
          status: "inelegivel",
          blockers: [{ rule_id: "ELG-004", description: "Imóvel em construção, reforma ou reconstrução", fact_keys: ["imovel_em_obra"] }],
          pending: [],
          redirect_to: null,
        });
        await ctx.say(
          "Obrigada por avisar. Com o imóvel em obra, este seguro não pode ser contratado agora. Quando a obra terminar, é só voltar aqui.",
        );
        return;
      }
      ctx.eligibility({ status: "elegivel", blockers: [], pending: [], redirect_to: null });
      await ctx.say("Ótimo saber que o imóvel não está em obras. Podemos prosseguir com as coberturas normais.");
    },
  },
  {
    label: "Estoque",
    group: "ativos",
    importance: "alta",
    question: {
      question_id: "q_estoque",
      fact_key: "possui_estoque",
      prompt: "Vocês mantêm estoque de mercadorias no local?",
      style: "aberta",
      input: YES_NO,
      reason: "Estoque é patrimônio que pode ser afetado por incêndio, roubo ou falta de energia.",
    },
    after: async (value, ctx) => {
      if (value === true) {
        ctx.avatar("consultando");
        await ctx.wait(700);
        ctx.patch([
          makeCard("valor_estoque_faixa", "Valor do estoque", "ativos", "50k_200k", "R$ 50 a 200 mil", "estimado", "grafo", {
            confidence: 0.45,
            importance: "alta",
            evidence: "Estimado a partir de negócios parecidos com o seu.",
            editable: { type: "select", options: MONEY_RANGE_OPTIONS },
          }),
        ]);
        ctx.avatar("explicando");
        await ctx.say(
          "Estimei o valor do estoque a partir de negócios parecidos. Confira no seu perfil: se não estiver certo, é só corrigir.",
        );
      } else {
        await ctx.say("Entendido, sem estoque no local simplificamos a proteção dos bens.");
      }
    },
  },
  {
    label: "Mercadoria refrigerada",
    group: "ativos",
    importance: "alta",
    when: (answers) => answers.atividade_efetiva === "alimentacao",
    question: {
      question_id: "q_refrigerada",
      fact_key: "mercadoria_refrigerada",
      prompt: "Parte das mercadorias fica em geladeiras, freezers ou câmaras frias?",
      style: "aberta",
      input: YES_NO,
      reason: "Uma falta de energia pode estragar o que está refrigerado.",
    },
    after: async (value, ctx) => {
      if (value === true) {
        await ctx.say("Importante! Vamos incluir coberturas voltadas para perda de mercadorias refrigeradas por danos elétricos ou falha no suprimento.");
      } else {
        await ctx.say("Tudo bem, menos esse fator de risco crítico para considerar.");
      }
    },
  },
  {
    label: "Segurança do local",
    group: "operacao",
    question: {
      question_id: "q_seguranca",
      fact_key: "seguranca_local",
      prompt: "Quais itens de segurança o local tem? Pode marcar mais de um.",
      style: "aberta",
      input: {
        type: "multiselect",
        options: [
          { value: "alarme", label: "Alarme" },
          { value: "cameras", label: "Câmeras" },
          { value: "vigilancia", label: "Vigilância" },
          { value: "grades", label: "Grades" },
          { value: "nenhuma", label: "Nenhum" },
        ],
      },
      reason: "Itens de segurança ajudam a entender a exposição a roubo e furto.",
    },
    after: async (value, ctx) => {
      const items = Array.isArray(value) ? value : [];
      if (items.includes("nenhuma") || items.length === 0) {
        await ctx.say("Compreendido. Vamos considerar a atenção adequada à proteção contra roubo e furto para o local.");
      } else {
        await ctx.say("Esses recursos de segurança reduzem riscos e ajudam muito na proteção patrimonial.");
      }
    },
  },
  {
    label: "Despesas fixas mensais",
    group: "continuidade",
    importance: "alta",
    question: {
      question_id: "q_despesas",
      fact_key: "despesas_fixas_mensais_faixa",
      prompt: "Quanto o negócio gasta por mês com aluguel, salários e contas, mesmo quando fica fechado?",
      style: "aberta",
      input: { type: "select", options: MONEY_RANGE_OPTIONS.slice(0, 4) },
      reason: "Mostra quanto o caixa precisa aguentar se o negócio parar por alguns dias.",
    },
    after: async (_value, ctx) => {
      await ctx.say("Essas despesas são essenciais para calcular a cobertura de despesas fixas em caso de interrupção.");
    },
  },
  {
    label: "Dias sem operar",
    group: "continuidade",
    question: {
      question_id: "q_tolerancia",
      fact_key: "dias_tolerancia_sem_operar",
      prompt: "Por quantos dias o negócio aguentaria ficar fechado sem comprometer as contas?",
      style: "aberta",
      input: { type: "number", min: 0, max: 365, unit: "dias" },
      reason: "Ajuda a dimensionar a proteção para despesas fixas.",
    },
    after: async (value, ctx) => {
      await ctx.say(`Entendi, ${value} dias de fôlego operacional. Ter essa clareza nos ajuda a calibrar a continuidade das despesas.`);
    },
  },
  {
    label: "Dados de clientes",
    group: "digital",
    importance: "media",
    question: {
      question_id: "q_dados",
      fact_key: "armazena_dados_clientes",
      prompt: "Vocês guardam dados de clientes, como cadastro ou pagamentos, em sistemas?",
      style: "aberta",
      input: YES_NO,
      reason: "Indica a exposição digital, considerada na proteção cibernética.",
    },
    after: async (value, ctx) => {
      if (value === true) {
        await ctx.say("Importante! Armazenar dados digitais pede atenção a vazamentos e incidentes cibernéticos.");
      } else {
        await ctx.say("Sem retenção sensível em sistemas, sua exposição a incidentes de dados é menor.");
      }
    },
  },
];

export const CLOSING =
  "Pronto! Já entendi melhor como o seu negócio funciona. Agora vou organizar as opções de proteção para você comparar com calma.";
