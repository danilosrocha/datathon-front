import type {
  ApiErrorBody,
  CaseSnapshot,
  CoverageCard,
  CreateCaseResponse,
  CustomizedOffer,
  FactValue,
  TurnAccepted,
  Violation,
} from "@/lib/api/types";

/** Cliente REST do perfilamento (CONTRATOS_API §6.1). Sem cache: o SSE é a fonte das atualizações. */

export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1`;

/** O motor recusou a personalização (422 `{ violations[] }`). */
export class CustomizeRejected extends Error {
  constructor(readonly violations: Violation[]) {
    super(violations.map((v) => v.message).join(" "));
    this.name = "CustomizeRejected";
  }
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly retryable: boolean,
    readonly violations?: Violation[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string | null } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Case-Token": token } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | (ApiErrorBody & { detail?: ApiErrorBody; violations?: Violation[] })
      | null;
    // FastAPI devolve o erro do contrato dentro de `detail` quando vem de HTTPException.
    const error = body?.error ?? body?.detail?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "http_error",
      error?.message ?? "Não foi possível falar com o servidor.",
      error?.retryable ?? response.status >= 500,
      body?.violations,
    );
  }
  return (await response.json()) as T;
}

export const casesApi = {
  create: () =>
    request<CreateCaseResponse>("/cases", { method: "POST", body: JSON.stringify({ consent: true, channel: "web" }) }),
  get: (caseId: string, token: string) => request<CaseSnapshot>(`/cases/${caseId}`, { token }),
  sendMessage: (caseId: string, token: string, text: string) =>
    request<TurnAccepted>(`/cases/${caseId}/messages`, { method: "POST", token, body: JSON.stringify({ text }) }),
  putFact: (caseId: string, token: string, key: string, value: FactValue) =>
    request<TurnAccepted>(`/cases/${caseId}/facts/${key}`, { method: "PUT", token, body: JSON.stringify({ value }) }),
  confirmFact: (caseId: string, token: string, key: string) =>
    request<TurnAccepted>(`/cases/${caseId}/facts/${key}/confirm`, { method: "POST", token }),
  deleteFact: (caseId: string, token: string, key: string) =>
    request<TurnAccepted>(`/cases/${caseId}/facts/${key}`, { method: "DELETE", token }),
};

export interface CoverageChange {
  code: string;
  active: boolean;
  insured_amount?: number;
}

export const offersApi = {
  coverageCards: (caseId: string, token: string, offerId: string) =>
    request<CoverageCard[]>(`/cases/${caseId}/offers/${offerId}/coverage-cards`, { token }),
  /** Mudanças cumulativas sobre a personalizada atual; `reset` volta à oferta do motor. */
  customize: async (
    caseId: string,
    token: string,
    offerId: string,
    body: { coverages?: CoverageChange[]; reset?: boolean },
  ) => {
    try {
      return await request<CustomizedOffer>(`/cases/${caseId}/offers/${offerId}/customize`, {
        method: "POST",
        token,
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.violations) {
        throw new CustomizeRejected(error.violations);
      }
      throw error;
    }
  },
};
