import type { AvatarState, Card, CaseSnapshot, ChatMessage, Eligibility, Question, Recommendation } from "@/lib/api/types";
import type { ServerEvent } from "@/lib/events";

/*
 * Estado da tela de perfil. Os eventos do servidor são a verdade final; as
 * ações locais só antecipam o que o `profile.patch` vai confirmar.
 */

export type ActivityKind = "identificado" | "atualizado" | "enriquecido" | "confirmar" | "atencao" | "pendente";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  text: string;
}

export interface EnrichmentEntry {
  source: string;
  status: "running" | "done" | "failed";
  detail?: string;
}

export interface CaseState {
  phase: "loading" | "ready" | "error";
  error: string | null;
  messages: ChatMessage[];
  /** Mensagens do assistente ainda em streaming (`message.delta`). */
  drafts: Record<string, string>;
  question: Question | null;
  /** Fim do roteiro de perguntas (L-12). */
  finished: boolean;
  cards: Record<string, Card>;
  order: string[];
  /** Cards removidos localmente, aguardando o prazo de desfazer. */
  hidden: string[];
  /** Cards recém-criados ou alterados, para a microinteração de destaque. */
  highlights: Record<string, "novo" | "atualizado">;
  avatar: AvatarState;
  busy: boolean;
  submittedQuestionId: string | null;
  eligibility: Eligibility | null;
  recommendation: Recommendation | null;
  enrichment: Record<string, EnrichmentEntry>;
  activity: ActivityItem[];
}

export type CaseAction =
  | { type: "server"; event: ServerEvent }
  | { type: "hydrate"; snapshot: CaseSnapshot }
  | { type: "failed"; message: string }
  | { type: "user_message"; message: ChatMessage }
  | { type: "optimistic_card"; card: Card }
  | { type: "hide_card"; key: string }
  | { type: "restore_card"; key: string }
  | { type: "clear_highlight"; key: string };

export const initialCaseState: CaseState = {
  phase: "loading",
  error: null,
  messages: [],
  drafts: {},
  question: null,
  finished: false,
  cards: {},
  order: [],
  hidden: [],
  highlights: {},
  avatar: "ouvindo",
  busy: false,
  submittedQuestionId: null,
  eligibility: null,
  recommendation: null,
  enrichment: {},
  activity: [],
};

const MAX_ACTIVITY = 6;
let activitySeq = 0;

function pushActivity(state: CaseState, kind: ActivityKind, text: string): ActivityItem[] {
  activitySeq += 1;
  return [{ id: `a${activitySeq}`, kind, text }, ...state.activity].slice(0, MAX_ACTIVITY);
}

function isEnrichmentSource(source: Card["source"]) {
  return source.startsWith("api_") || source === "receita_cnpj" || source === "base_comum";
}

function applyPatch(state: CaseState, upsert: Card[], remove: string[]): CaseState {
  const cards = { ...state.cards };
  let order = state.order.filter((key) => !remove.includes(key));
  const highlights = { ...state.highlights };
  let next: CaseState = state;

  for (const key of remove) {
    delete cards[key];
    delete highlights[key];
  }

  for (const card of upsert) {
    if (card.status === "rejeitado") {
      delete cards[card.key];
      order = order.filter((key) => key !== card.key);
      continue;
    }
    const previous = cards[card.key];
    cards[card.key] = card;
    if (!previous) order = [...order, card.key];

    const changed = !previous || previous.display_value !== card.display_value || previous.status !== card.status;
    if (!changed) continue;
    highlights[card.key] = previous ? "atualizado" : "novo";

    let kind: ActivityKind;
    let text: string;
    if (card.status === "estimado") {
      kind = "confirmar";
      text = `Confira: ${card.label} (estimado)`;
    } else if (!previous && isEnrichmentSource(card.source)) {
      kind = "enriquecido";
      text = `Dado enriquecido: ${card.label}`;
    } else if (!previous) {
      // Fatos de alta importância sobre bens, continuidade ou exposição digital apontam uma necessidade de proteção.
      const signalsNeed = card.importance === "alta" && !["identificacao", "local"].includes(card.group);
      kind = signalsNeed ? "atencao" : "identificado";
      text = signalsNeed ? `Nova necessidade de proteção a avaliar: ${card.label}` : `Informação identificada: ${card.label}`;
    } else {
      kind = "atualizado";
      text = `Perfil atualizado: ${card.label}`;
    }
    next = { ...next, activity: pushActivity(next, kind, text) };
  }

  return { ...next, cards, order, highlights };
}

export function caseReducer(state: CaseState, action: CaseAction): CaseState {
  switch (action.type) {
    case "hydrate": {
      const { snapshot } = action;
      const cards = Object.fromEntries(snapshot.cards.filter((c) => c.status !== "rejeitado").map((c) => [c.key, c]));
      return {
        ...state,
        phase: "ready",
        error: null,
        messages: snapshot.messages,
        drafts: {},
        question: snapshot.question,
        submittedQuestionId: null,
        finished: snapshot.question === null && snapshot.messages.length > 0,
        cards,
        order: Object.keys(cards),
        avatar: snapshot.avatar_state,
        eligibility: snapshot.eligibility,
        recommendation: snapshot.recommendation,
      };
    }
    case "failed":
      return { ...state, phase: "error", error: action.message };
    case "user_message":
      return { ...state, messages: [...state.messages, action.message], submittedQuestionId: state.question?.question_id ?? null };
    case "optimistic_card": {
      const exists = Boolean(state.cards[action.card.key]);
      return {
        ...state,
        cards: { ...state.cards, [action.card.key]: action.card },
        order: exists ? state.order : [...state.order, action.card.key],
        highlights: { ...state.highlights, [action.card.key]: "atualizado" },
        activity: pushActivity(state, "atualizado", `Perfil atualizado: ${action.card.label}`),
      };
    }
    case "hide_card":
      return { ...state, hidden: [...state.hidden, action.key] };
    case "restore_card":
      return { ...state, hidden: state.hidden.filter((key) => key !== action.key) };
    case "clear_highlight": {
      const highlights = { ...state.highlights };
      delete highlights[action.key];
      return { ...state, highlights };
    }
    case "server":
      return applyServerEvent(state, action.event);
  }
}

function applyServerEvent(state: CaseState, event: ServerEvent): CaseState {
  switch (event.event) {
    case "turn.started":
      return { ...state, busy: true };
    case "turn.completed":
      return { ...state, busy: false, submittedQuestionId: null };
    case "avatar.state":
      return { ...state, avatar: event.data.state };
    case "message.delta":
      return {
        ...state,
        drafts: { ...state.drafts, [event.data.message_id]: (state.drafts[event.data.message_id] ?? "") + event.data.delta },
      };
    case "message.completed": {
      const drafts = { ...state.drafts };
      delete drafts[event.data.message_id];
      if (state.messages.some((m) => m.message_id === event.data.message_id)) return { ...state, drafts };
      return {
        ...state,
        drafts,
        messages: [
          ...state.messages,
          { message_id: event.data.message_id, role: "assistant", text: event.data.text, ts: new Date().toISOString() },
        ],
      };
    }
    case "question":
      return { ...state, question: event.data, finished: event.data === null, submittedQuestionId: null };
    case "profile.patch":
      return applyPatch(state, event.data.upsert, event.data.remove);
    case "enrichment.status": {
      const enrichment = { ...state.enrichment, [event.data.source]: event.data };
      const activity =
        event.data.status === "running" && event.data.detail
          ? pushActivity(state, "enriquecido", event.data.detail)
          : state.activity;
      return { ...state, enrichment, activity };
    }
    case "eligibility.updated": {
      const pendingCount = event.data.pending.length;
      const activity =
        event.data.status === "pendente" && pendingCount
          ? pushActivity(state, "pendente", `${pendingCount} ${pendingCount > 1 ? "informações precisam" : "informação precisa"} de confirmação`)
          : state.activity;
      return { ...state, eligibility: event.data, activity };
    }
    case "recommendation.ready":
      return { ...state, recommendation: event.data };
    case "error":
      return { ...state, busy: false, submittedQuestionId: null, error: event.data.message };
  }
}
