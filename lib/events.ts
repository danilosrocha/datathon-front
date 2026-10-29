import type { AvatarState, Card, Eligibility, Question, Recommendation } from "@/lib/api/types";

/**
 * Eventos SSE de `GET /cases/{id}/events` — cópia fiel de CONTRATOS_API §7,
 * com uma exceção documentada: `question` aceita `null` para sinalizar que
 * não há mais perguntas (lacuna L-12, docs/LACUNAS.md).
 */
export type ServerEvent =
  | { event: "turn.started"; data: { turn_id: string } }
  | { event: "avatar.state"; data: { state: AvatarState } }
  | { event: "message.delta"; data: { message_id: string; delta: string } }
  | { event: "message.completed"; data: { message_id: string; role: "assistant"; text: string } }
  | { event: "question"; data: Question | null }
  | { event: "profile.patch"; data: { upsert: Card[]; remove: string[] } }
  | { event: "enrichment.status"; data: { source: string; status: "running" | "done" | "failed"; detail?: string } }
  | { event: "eligibility.updated"; data: Eligibility }
  | { event: "recommendation.ready"; data: Recommendation }
  | { event: "turn.completed"; data: { turn_id: string } }
  | { event: "error"; data: { code: string; message: string; retryable: boolean } };

export type ServerEventName = ServerEvent["event"];

const EVENT_NAMES: ReadonlySet<string> = new Set<ServerEventName>([
  "turn.started",
  "avatar.state",
  "message.delta",
  "message.completed",
  "question",
  "profile.patch",
  "enrichment.status",
  "eligibility.updated",
  "recommendation.ready",
  "turn.completed",
  "error",
]);

export function isServerEventName(name: string): name is ServerEventName {
  return EVENT_NAMES.has(name);
}
