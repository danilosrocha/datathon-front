"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import type { FactValue } from "@/lib/api/types";
import { caseReducer, initialCaseState } from "@/lib/case/reducer";
import { MissingTokenError, caseTransport } from "@/lib/case/transport";
import { displayValue } from "@/lib/format";

const UNDO_MS = 5000;
const HIGHLIGHT_MS = 2600;

export function useCaseSession(caseId: string) {
  const [state, dispatch] = useReducer(caseReducer, initialCaseState);
  const stateRef = useRef(state);
  const pendingRemovals = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Snapshot → assinatura do SSE; após reconectar, refaz o snapshot (CLAUDE.md do front).
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const resync = () =>
      caseTransport
        .getCase(caseId)
        .then((snapshot) => !cancelled && dispatch({ type: "hydrate", snapshot }))
        .catch(() => undefined);

    caseTransport
      .getCase(caseId)
      .then((snapshot) => {
        if (cancelled) return;
        dispatch({ type: "hydrate", snapshot });
        unsubscribe = caseTransport.subscribe(caseId, {
          onEvent: (event) => dispatch({ type: "server", event }),
          onReconnect: resync,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        dispatch({
          type: "failed",
          message:
            error instanceof MissingTokenError
              ? "Não encontramos esta conversa neste navegador."
              : error instanceof Error
                ? error.message
                : "Não foi possível carregar a conversa.",
        });
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [caseId]);

  // Remove o destaque de "novo/atualizado" depois de alguns segundos.
  useEffect(() => {
    const timers = Object.keys(state.highlights).map((key) =>
      setTimeout(() => dispatch({ type: "clear_highlight", key }), HIGHLIGHT_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [state.highlights]);

  // Ao sair da tela, envia as remoções cujo prazo de desfazer ainda corria.
  useEffect(() => {
    const removals = pendingRemovals.current;
    return () => {
      removals.forEach((timer, key) => {
        clearTimeout(timer);
        void caseTransport.deleteFact(caseId, key).catch(() => undefined);
      });
      removals.clear();
    };
  }, [caseId]);

  const fail = useCallback(() => {
    toast.error("Não consegui enviar agora. Tente de novo em instantes.");
  }, []);

  const answerQuestion = useCallback(
    (value: FactValue) => {
      const question = stateRef.current.question;
      if (!question) return;
      dispatch({
        type: "user_message",
        message: { message_id: crypto.randomUUID(), role: "user", text: displayValue(question.input, value), ts: new Date().toISOString() },
      });
      caseTransport.putFact(caseId, question.fact_key, value).catch((error: unknown) => {
        // Texto livre que não passa no formato do fato (ex.: "padaria" para o CNAE) vira mensagem:
        // o Extrator interpreta e o motor segue com o fato extraído.
        if (error instanceof ApiError && error.status === 422 && typeof value === "string") {
          caseTransport.sendMessage(caseId, value).catch(fail);
          return;
        }
        fail();
      });
    },
    [caseId, fail],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      dispatch({
        type: "user_message",
        message: { message_id: crypto.randomUUID(), role: "user", text: trimmed, ts: new Date().toISOString() },
      });
      caseTransport.sendMessage(caseId, trimmed).catch(fail);
    },
    [caseId, fail],
  );

  const editFact = useCallback(
    (key: string, value: FactValue) => {
      const card = stateRef.current.cards[key];
      if (!card) return;
      dispatch({
        type: "optimistic_card",
        card: { ...card, value, display_value: displayValue(card.editable, value), status: "confirmado", source: "usuario_resposta", confidence: 1 },
      });
      caseTransport.putFact(caseId, key, value).catch(fail);
    },
    [caseId, fail],
  );

  const confirmFact = useCallback(
    (key: string) => {
      const card = stateRef.current.cards[key];
      if (!card) return;
      dispatch({ type: "optimistic_card", card: { ...card, status: "confirmado", confidence: 1 } });
      caseTransport.confirmFact(caseId, key).catch(fail);
    },
    [caseId, fail],
  );

  const removeFact = useCallback(
    (key: string) => {
      const card = stateRef.current.cards[key];
      if (!card || pendingRemovals.current.has(key)) return;
      dispatch({ type: "hide_card", key });

      const timer = setTimeout(() => {
        pendingRemovals.current.delete(key);
        caseTransport.deleteFact(caseId, key).catch(() => {
          dispatch({ type: "restore_card", key });
          fail();
        });
      }, UNDO_MS);
      pendingRemovals.current.set(key, timer);

      toast(`“${card.label}” foi removido do perfil`, {
        duration: UNDO_MS,
        action: {
          label: "Desfazer",
          onClick: () => {
            clearTimeout(timer);
            pendingRemovals.current.delete(key);
            dispatch({ type: "restore_card", key });
          },
        },
      });
    },
    [caseId, fail],
  );

  return { state, answerQuestion, sendMessage, editFact, confirmFact, removeFact };
}

export type CaseSession = ReturnType<typeof useCaseSession>;
