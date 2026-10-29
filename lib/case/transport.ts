import { API_BASE_URL, casesApi } from "@/lib/api/client";
import type { CaseSnapshot, CreateCaseResponse, FactValue } from "@/lib/api/types";
import type { ServerEvent } from "@/lib/events";
import { readCaseToken } from "@/lib/case/token-storage";
import { mockTransport } from "@/lib/mock/mock-transport";
import { subscribeEvents } from "@/lib/sse";

/**
 * Tudo o que a tela de perfil faz com o caso. A implementação HTTP fala com o
 * FastAPI; a mock reproduz o mesmo contrato de eventos sem backend.
 */
export interface CaseTransport {
  readonly mode: "api" | "mock";
  createCase(): Promise<CreateCaseResponse>;
  getCase(caseId: string): Promise<CaseSnapshot>;
  subscribe(
    caseId: string,
    handlers: { onEvent: (event: ServerEvent) => void; onReconnect?: () => void },
  ): () => void;
  sendMessage(caseId: string, text: string): Promise<void>;
  putFact(caseId: string, key: string, value: FactValue): Promise<void>;
  confirmFact(caseId: string, key: string): Promise<void>;
  deleteFact(caseId: string, key: string): Promise<void>;
}

export class MissingTokenError extends Error {
  constructor() {
    super("Token do caso não encontrado neste navegador.");
    this.name = "MissingTokenError";
  }
}

function tokenFor(caseId: string) {
  const token = readCaseToken(caseId);
  if (!token) throw new MissingTokenError();
  return token;
}

const httpTransport: CaseTransport = {
  mode: "api",
  createCase: () => casesApi.create(),
  getCase: (caseId) => casesApi.get(caseId, tokenFor(caseId)),
  subscribe: (caseId, { onEvent, onReconnect }) =>
    subscribeEvents({ url: `${API_BASE_URL}/cases/${caseId}/events`, token: tokenFor(caseId), onEvent, onReconnect }),
  sendMessage: async (caseId, text) => {
    await casesApi.sendMessage(caseId, tokenFor(caseId), text);
  },
  putFact: async (caseId, key, value) => {
    await casesApi.putFact(caseId, tokenFor(caseId), key, value);
  },
  confirmFact: async (caseId, key) => {
    await casesApi.confirmFact(caseId, tokenFor(caseId), key);
  },
  deleteFact: async (caseId, key) => {
    await casesApi.deleteFact(caseId, tokenFor(caseId), key);
  },
};

/** Mock quando `NEXT_PUBLIC_USE_MOCKS=true` ou sem `NEXT_PUBLIC_API_URL` (degradação graciosa). */
export const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_MOCKS === "true" || !process.env.NEXT_PUBLIC_API_URL;

export const caseTransport: CaseTransport = USE_MOCKS ? mockTransport : httpTransport;
