"use client";

import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { ChevronDown, Loader2 } from "lucide-react";

import { FactCard } from "@/components/profile/fact-card";
import type { Card, FactValue } from "@/lib/api/types";
import type { CaseState } from "@/lib/case/reducer";
import { groupCards } from "@/lib/case/presentation";
import { cn } from "@/lib/utils";

interface ProfilePanelProps {
  state: CaseState;
  onEdit: (key: string, value: FactValue) => void;
  onConfirm: (key: string) => void;
  onRemove: (key: string) => void;
  className?: string;
}

export function visibleCards(state: CaseState): Card[] {
  return state.order.filter((key) => !state.hidden.includes(key) && state.cards[key]).map((key) => state.cards[key]);
}

/** Pendências primeiro; o perfil completo continua disponível sob demanda. */
export function ProfilePanel({ state, onEdit, onConfirm, onRemove, className }: ProfilePanelProps) {
  const titleId = useId();
  const cards = visibleCards(state);
  const estimates = cards.filter((card) => card.status === "estimado");
  const groups = groupCards(cards.filter((card) => card.status !== "estimado"));
  const running = Object.values(state.enrichment).find((entry) => entry.status === "running");
  const actions = { onEdit, onConfirm, onRemove };

  return (
    <section aria-labelledby={titleId} className={cn("flex min-h-0 flex-col", className)}>
      <header className="shrink-0 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="font-heading text-lg font-semibold text-brand-900">Para você confirmar</h2>
          <span className="rounded-full bg-sun-400/25 px-2 py-0.5 text-xs font-bold text-brand-900" aria-label={`${estimates.length} informações para confirmar`}>{estimates.length}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-600">Revise as estimativas antes de usá-las no seu perfil.</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
        <div aria-live="polite" aria-atomic="true" className="sr-only">{estimates.length} informações para confirmar</div>
        {running && <p className="mb-3 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-900"><Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />{running.detail ?? "Consultando fontes públicas…"}</p>}
        {estimates.length > 0 ? (
          <ul className="space-y-2"><AnimatePresence initial={false}>{estimates.map((card) => <FactCard key={card.key} card={card} highlight={state.highlights[card.key]} {...actions} />)}</AnimatePresence></ul>
        ) : (
          <p className="rounded-lg border border-dashed border-brand-200 px-3 py-3 text-sm text-ink-600">Nenhuma informação para confirmar agora.</p>
        )}

        {state.eligibility?.status === "pendente" && state.eligibility.pending.length > 0 && (
          <div className="mt-3 rounded-lg border border-dashed border-sun-400 bg-sun-400/15 px-3 py-2 text-sm text-brand-900">
            <p className="font-semibold">Informações pendentes</p>
            <ul className="mt-1 space-y-0.5 text-xs text-ink-600">{state.eligibility.pending.map((item) => <li key={item.fact_key}>{item.why}</li>)}</ul>
          </div>
        )}

        <div className="mt-5 border-t border-brand-100 pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-heading text-base font-semibold text-brand-900">Resumo do perfil</h3>
            <span className="text-xs text-ink-600">{cards.length} {cards.length === 1 ? "informação" : "informações"}</span>
          </div>
          {groups.length === 0 ? (
            <p className="mt-2 text-sm text-ink-600">Seu perfil aparece aqui conforme a conversa avança.</p>
          ) : (
            <div className="mt-2 divide-y divide-brand-100">
              {groups.map(({ section, cards: sectionCards }) => (
                <details key={section.id} className="group py-2">
                  <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-md text-sm text-brand-900 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1 font-medium">{section.title}</span>
                    <span className="text-xs text-ink-600">{sectionCards.length}</span>
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <ul className="space-y-2 pt-2">{sectionCards.map((card) => <FactCard key={card.key} card={card} highlight={state.highlights[card.key]} {...actions} />)}</ul>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
