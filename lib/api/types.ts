/*
 * Tipos do contrato REST (docs/CONTRATOS_API.md §2–§3, §6.1).
 * Escritos à mão até o backend publicar o OpenAPI; depois, substituir por
 * `pnpm gen:api` (schema.d.ts) mantendo estes nomes como aliases.
 */

export type FactStatus = "observado" | "derivado" | "estimado" | "confirmado" | "rejeitado";

export type FactSource =
  | "usuario_texto"
  | "usuario_resposta"
  | "base_comum"
  | "receita_cnpj"
  | "formula"
  | "api_territorio"
  | "api_clima"
  | "api_desastres"
  | "api_seguranca"
  | "grafo";

export type AvatarState =
  | "ouvindo"
  | "pensando"
  | "consultando"
  | "sorrindo"
  | "explicando"
  | "preocupado"
  | "comemorando";

export type EligibilityStatus = "elegivel" | "inelegivel" | "pendente";
export type CaseStatus =
  | "em_perfilamento"
  | "recomendado"
  | "inelegivel"
  | "em_contratacao"
  | "contratado_simulado"
  | "abandonado";
export type NeedPriority = "alta" | "media" | "baixa";

export type CardGroup =
  | "identificacao"
  | "local"
  | "operacao"
  | "ativos"
  | "continuidade"
  | "digital"
  | "riscos_regiao";

export interface Option {
  value: string;
  label: string;
}

/**
 * `multiselect` NÃO consta no contrato original: lacuna L-11 (docs/LACUNAS.md),
 * necessária para fatos do tipo lista (`seguranca_local`, `controles_digitais`).
 */
export type InputSpec =
  | { type: "boolean" }
  | { type: "select"; options: Option[] }
  | { type: "multiselect"; options: Option[] }
  | { type: "number"; min?: number; max?: number; unit?: string }
  | { type: "text" }
  | { type: "cnpj" }
  | { type: "cep" };

export type FactValue = string | number | boolean | string[] | null;

export interface Card {
  key: string;
  label: string;
  group: CardGroup;
  value: FactValue;
  display_value: string;
  status: FactStatus;
  source: FactSource;
  confidence: number;
  evidence: string | null;
  importance: NeedPriority;
  editable: InputSpec | null;
  updated_at: string;
}

export interface Question {
  question_id: string;
  fact_key: string;
  prompt: string;
  style: "aberta" | "confirmacao";
  input: InputSpec;
  reason: string;
}

export interface Eligibility {
  status: EligibilityStatus;
  blockers: { rule_id: string; description: string; fact_keys: string[] }[];
  pending: { fact_key: string; rule_id: string; why: string }[];
  rules_version?: string;
  redirect_to: string | null;
}

/** Subconjunto usado nesta tela; o modelo completo está em CONTRATOS_API §3.5. */
export interface Recommendation {
  recommendation_id: string;
  case_id: string;
  status: "conclusiva" | "preliminar";
  offers: { offer_id: string; kind: "melhor_ajuste" | "custo_beneficio" | "protecao_ampliada"; plan_code: string; title: string; coverage_cards?: CoverageCard[] }[];
}

export interface MoneyRange {
  min: number;
  max: number;
}

/** Um card por cobertura do catálogo (CONTRATOS_API §3.5): base da tela de Personalizar. */
export interface CoverageCard {
  code: string;
  name: string;
  group: "fixa" | "padrao_plano" | "especifica_atividade" | "opcional";
  dimension: string;
  status: "incluida" | "disponivel" | "indisponivel";
  suggested: boolean;
  origin: "sugerida" | "adicionada_cliente" | null;
  actions: ("remover" | "adicionar" | "ajustar_is")[];
  lock_reason: string | null;
  insured_amount: MoneyRange | null;
  is_escolhida: number | null;
  is_limits: MoneyRange | null;
  justification: string | null;
  warning: string | null;
}

/** Oferta devolvida por Personalizar; só os campos usados na tela. */
export interface CustomizedOffer {
  offer_id: string;
  kind: "melhor_ajuste" | "custo_beneficio" | "protecao_ampliada" | "personalizada";
  base_offer_id: string | null;
  plan_code: string;
  diff_vs_best: string[];
  coverage_cards: CoverageCard[];
}

export interface Violation {
  code: string;
  coverage_code: string | null;
  message: string;
}

export interface ChatMessage {
  message_id: string;
  role: "assistant" | "user";
  text: string;
  ts: string;
}

export interface CaseSnapshot {
  case_id: string;
  status: CaseStatus;
  cards: Card[];
  question: Question | null;
  messages: ChatMessage[];
  eligibility: Eligibility | null;
  recommendation: Recommendation | null;
  avatar_state: AvatarState;
  progress: { answered: number; estimated_remaining: number };
}

export interface CreateCaseResponse {
  case_id: string;
  case_token: string;
}

export interface TurnAccepted {
  turn_id: string;
}

export interface ApiErrorBody {
  error: { code: string; message: string; retryable: boolean };
}
