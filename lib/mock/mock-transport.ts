import type { CaseSnapshot, ChatMessage, FactValue, InputSpec } from "@/lib/api/types";
import type { ServerEvent } from "@/lib/events";
import type { CaseTransport } from "@/lib/case/transport";
import { displayValue, isValidCep } from "@/lib/format";
import { CLOSING, GREETING, STEPS, makeCard, type ScriptContext, type ScriptStep } from "@/lib/mock/roteiro-demo";

/*
 * Transporte de demonstração: mesmo contrato do FastAPI (REST + eventos SSE),
 * reproduzindo o roteiro gravado em memória. Recarregar a página perde o caso.
 */

const WORD_DELAY_MS = 28;
const MIN_TURN_MS = 450;

type Listener = (event: ServerEvent) => void;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const id = () => crypto.randomUUID();

class MockCase {
  readonly listeners = new Set<Listener>();
  readonly answers: Record<string, FactValue> = {};
  snapshot: CaseSnapshot;
  private started = false;
  private stepIndex = -1;
  private stopped = false;
  private queue: Promise<void> = Promise.resolve();

  constructor(caseId: string) {
    this.snapshot = {
      case_id: caseId,
      status: "em_perfilamento",
      cards: [],
      question: null,
      messages: [],
      eligibility: null,
      recommendation: null,
      avatar_state: "ouvindo",
      progress: { answered: 0, estimated_remaining: STEPS.length },
    };
  }

  private get currentStep(): ScriptStep | undefined {
    return STEPS[this.stepIndex];
  }

  emit(event: ServerEvent) {
    const snap = this.snapshot;
    switch (event.event) {
      case "avatar.state":
        snap.avatar_state = event.data.state;
        break;
      case "message.completed":
        snap.messages.push({ message_id: event.data.message_id, role: "assistant", text: event.data.text, ts: new Date().toISOString() });
        break;
      case "question":
        snap.question = event.data;
        break;
      case "profile.patch":
        snap.cards = [
          ...snap.cards.filter((card) => !event.data.remove.includes(card.key) && !event.data.upsert.some((u) => u.key === card.key)),
          ...event.data.upsert,
        ];
        break;
      case "eligibility.updated":
        snap.eligibility = event.data;
        if (event.data.status === "inelegivel") snap.status = "inelegivel";
        break;
      case "recommendation.ready":
        snap.recommendation = event.data;
        snap.status = "recomendado";
        break;
    }
    this.listeners.forEach((listener) => listener(event));
  }

  /** Serializa turnos, como o grafo do backend faz por caso. */
  turn(run: (ctx: ScriptContext) => Promise<void>) {
    this.queue = this.queue.then(async () => {
      const turnId = id();
      this.emit({ event: "turn.started", data: { turn_id: turnId } });
      const startedAt = Date.now();
      await run(this.context());
      await wait(Math.max(0, MIN_TURN_MS - (Date.now() - startedAt)));
      this.emit({ event: "turn.completed", data: { turn_id: turnId } });
    });
    return this.queue;
  }

  private context(): ScriptContext {
    return {
      answers: this.answers,
      wait,
      avatar: (state) => this.emit({ event: "avatar.state", data: { state } }),
      patch: (cards) => this.emit({ event: "profile.patch", data: { upsert: cards, remove: [] } }),
      eligibility: (value) => this.emit({ event: "eligibility.updated", data: value }),
      enrich: async (source, detail, run) => {
        this.emit({ event: "avatar.state", data: { state: "consultando" } });
        this.emit({ event: "enrichment.status", data: { source, status: "running", detail } });
        await run();
        this.emit({ event: "enrichment.status", data: { source, status: "done", detail: "Pronto" } });
      },
      say: (text) => this.say(text),
    };
  }

  private async say(text: string) {
    const messageId = id();
    this.emit({ event: "avatar.state", data: { state: "explicando" } });
    const words = text.split(/(\s+)/);
    for (const word of words) {
      this.emit({ event: "message.delta", data: { message_id: messageId, delta: word } });
      if (word.trim()) await wait(WORD_DELAY_MS);
    }
    this.emit({ event: "message.completed", data: { message_id: messageId, role: "assistant", text } });
  }

  private async askNext() {
    if (this.stopped) return;
    let next = this.stepIndex + 1;
    while (next < STEPS.length && STEPS[next].when && !STEPS[next].when!(this.answers)) next += 1;
    this.stepIndex = next;
    this.snapshot.progress = {
      answered: Object.keys(this.answers).length,
      estimated_remaining: STEPS.slice(next).filter((step) => !step.when || step.when(this.answers)).length,
    };
    const step = STEPS[next];
    if (!step) {
      this.snapshot.question = null;
      this.emit({ event: "avatar.state", data: { state: "comemorando" } });
      await this.say(CLOSING);
      this.emit({ event: "question", data: null });
      this.emit({
        event: "recommendation.ready",
        data: {
          recommendation_id: id(),
          case_id: this.snapshot.case_id,
          status: "preliminar",
          offers: [
            { offer_id: id(), kind: "melhor_ajuste", plan_code: "PRATICO", title: "Plano Prático" },
            { offer_id: id(), kind: "custo_beneficio", plan_code: "ESSENCIAL", title: "Plano Essencial" },
            { offer_id: id(), kind: "protecao_ampliada", plan_code: "TOTAL", title: "Plano Total" },
          ],
        },
      });
      return;
    }
    this.emit({ event: "question", data: step.question });
    this.emit({ event: "avatar.state", data: { state: "ouvindo" } });
  }

  start() {
    if (this.started) return;
    this.started = true;
    void this.turn(async () => {
      this.emit({ event: "avatar.state", data: { state: "sorrindo" } });
      await this.say(GREETING);
      await this.askNext();
    });
  }

  answer(key: string, value: FactValue, evidence: string | null, source: "usuario_resposta" | "usuario_texto") {
    const step = this.currentStep;
    return this.turn(async (ctx) => {
      if (step && step.question.fact_key === key) {
        this.answers[key] = value;
        ctx.patch([
          makeCard(key, step.label, step.group, value, displayValue(step.question.input, value), "confirmado", source, {
            evidence,
            importance: step.importance,
            editable: step.question.input,
          }),
        ]);
        await step.after?.(value, ctx);
        if (step.stop?.(value)) {
          this.stopped = true;
          this.snapshot.question = null;
          this.emit({ event: "question", data: null });
          return;
        }
        await this.askNext();
        return;
      }
      // Correção feita pelo card: atualiza o fato sem mudar a pergunta atual.
      const card = this.snapshot.cards.find((item) => item.key === key);
      if (!card) return;
      this.answers[key] = value;
      ctx.patch([
        { ...card, value, display_value: displayValue(card.editable, value), status: "confirmado", source: "usuario_resposta", confidence: 1, updated_at: new Date().toISOString() },
      ]);
      ctx.avatar("sorrindo");
    });
  }
}

const cases = new Map<string, MockCase>();

function getMockCase(caseId: string) {
  const mockCase = cases.get(caseId);
  if (!mockCase) throw new Error("Caso de demonstração não encontrado. Comece uma nova conversa.");
  return mockCase;
}

/** Interpreta texto livre para a pergunta atual — só no modo demonstração. */
function parseFreeText(text: string, input: InputSpec): FactValue | undefined {
  const normalized = text.trim().toLowerCase();
  switch (input.type) {
    case "text":
      return text.trim();
    case "cep":
      return isValidCep(text) ? text.replace(/\D/g, "") : undefined;
    case "number": {
      const match = normalized.match(/\d+/);
      return match ? Number(match[0]) : undefined;
    }
    case "boolean":
      if (/^(sim|s|tenho|temos|yes)\b/.test(normalized)) return true;
      if (/^(n[aã]o|nao|n)\b/.test(normalized)) return false;
      return undefined;
    case "select":
      return input.options.find((option) => normalized.includes(option.label.toLowerCase().split(/[ ,]/)[0]))?.value;
    case "multiselect": {
      const values = input.options.filter((option) => normalized.includes(option.label.toLowerCase())).map((o) => o.value);
      return values.length ? values : undefined;
    }
    default:
      return undefined;
  }
}

export const mockTransport: CaseTransport = {
  mode: "mock",
  async createCase() {
    const caseId = id();
    cases.set(caseId, new MockCase(caseId));
    return { case_id: caseId, case_token: `demo-${caseId}` };
  },
  async getCase(caseId) {
    return structuredClone(getMockCase(caseId).snapshot);
  },
  subscribe(caseId, { onEvent }) {
    const mockCase = cases.get(caseId);
    if (!mockCase) return () => undefined;
    mockCase.listeners.add(onEvent);
    mockCase.start();
    return () => mockCase.listeners.delete(onEvent);
  },
  async sendMessage(caseId, text) {
    const mockCase = getMockCase(caseId);
    const userMessage: ChatMessage = { message_id: id(), role: "user", text, ts: new Date().toISOString() };
    mockCase.snapshot.messages.push(userMessage);
    const question = mockCase.snapshot.question;
    const value = question ? parseFreeText(text, question.input) : undefined;
    if (question && value !== undefined) {
      await mockCase.answer(question.fact_key, value, `Você disse: “${text.trim()}”`, "usuario_texto");
      return;
    }
    void mockCase.turn(async (ctx) => {
      await ctx.say(
        question
          ? "Anotei! Para seguir, responda à pergunta em destaque — pode usar as opções ou escrever de outro jeito."
          : "Anotei! Se quiser mudar alguma informação, é só corrigir no seu perfil.",
      );
      ctx.avatar("ouvindo");
    });
  },
  async putFact(caseId, key, value) {
    const mockCase = getMockCase(caseId);
    const question = mockCase.snapshot.question;
    if (question?.fact_key === key) {
      mockCase.snapshot.messages.push({
        message_id: id(),
        role: "user",
        text: displayValue(question.input, value),
        ts: new Date().toISOString(),
      });
    }
    void mockCase.answer(key, value, null, "usuario_resposta");
  },
  async confirmFact(caseId, key) {
    const mockCase = getMockCase(caseId);
    const card = mockCase.snapshot.cards.find((item) => item.key === key);
    if (!card) return;
    void mockCase.turn(async (ctx) => {
      ctx.patch([{ ...card, status: "confirmado", confidence: 1, updated_at: new Date().toISOString() }]);
      ctx.avatar("sorrindo");
    });
  },
  async deleteFact(caseId, key) {
    const mockCase = getMockCase(caseId);
    mockCase.emit({ event: "profile.patch", data: { upsert: [], remove: [key] } });
  },
};
