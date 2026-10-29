"use client";

import { useEffect, useState } from "react";
import { Lock, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CustomizeRejected, offersApi } from "@/lib/api/client";
import type { CoverageCard, CustomizedOffer } from "@/lib/api/types";
import { readCaseToken } from "@/lib/case/token-storage";
import { cn } from "@/lib/utils";

const GROUP_LABEL: Record<CoverageCard["group"], string> = {
  fixa: "Cobertura obrigatória",
  padrao_plano: "Cobertura do plano",
  especifica_atividade: "Cobertura da atividade",
  opcional: "Cobertura opcional",
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function rangeText(card: CoverageCard) {
  if (card.is_escolhida != null) return `Indenização máxima escolhida: ${brl.format(card.is_escolhida)}`;
  if (card.insured_amount) {
    return `Faixa sugerida: ${brl.format(card.insured_amount.min)} a ${brl.format(card.insured_amount.max)}`;
  }
  return null;
}

/**
 * Personalizar com o motor (CONTRATOS_API §6.1): cada cobertura do catálogo é um card; ligar ou
 * desligar chama `/customize`, e o backend devolve os cards revalidados ou as `violations[]`.
 */
export function CoverageCustomizer({
  caseId,
  offerId,
  initialCards,
  assistances,
  onCustomized,
}: {
  caseId: string;
  offerId: string;
  initialCards?: CoverageCard[];
  assistances: string[];
  onCustomized?: (offer: CustomizedOffer | null) => void;
}) {
  const [personalized, setPersonalized] = useState<CustomizedOffer | null>(null);
  const [baseCards, setBaseCards] = useState<CoverageCard[] | null>(initialCards?.length ? initialCards : null);
  const [busyCode, setBusyCode] = useState<string | null>(null);

  // O componente é remontado por oferta (`key`); só busca os cards quando a oferta não os trouxe.
  useEffect(() => {
    if (initialCards?.length) return;
    const token = readCaseToken(caseId);
    if (!token) return;
    let cancelled = false;
    offersApi
      .coverageCards(caseId, token, offerId)
      .then((cards) => !cancelled && setBaseCards(cards))
      .catch(() => !cancelled && setBaseCards([]));
    return () => {
      cancelled = true;
    };
  }, [caseId, offerId, initialCards]);

  const cards = personalized?.coverage_cards ?? baseCards;

  async function send(body: Parameters<typeof offersApi.customize>[3], code: string) {
    const token = readCaseToken(caseId);
    if (!token) return;
    setBusyCode(code);
    try {
      // Mudanças cumulativas: a próxima aplica sobre a personalizada atual.
      const target = personalized && !body.reset ? personalized.offer_id : offerId;
      const offer = await offersApi.customize(caseId, token, target, body);
      const next = offer.kind === "personalizada" ? offer : null;
      setPersonalized(next);
      if (body.reset) setBaseCards(offer.coverage_cards);
      onCustomized?.(next);
    } catch (error) {
      toast.error(error instanceof CustomizeRejected ? error.message : "Não consegui atualizar o plano agora.");
    } finally {
      setBusyCode(null);
    }
  }

  function toggle(card: CoverageCard) {
    if (card.status === "incluida" && card.actions.includes("remover")) {
      void send({ coverages: [{ code: card.code, active: false }] }, card.code);
    } else if (card.status === "disponivel" && card.actions.includes("adicionar")) {
      void send({ coverages: [{ code: card.code, active: true }] }, card.code);
    }
  }

  if (!cards) return <p className="mt-4 text-sm text-ink-600">Carregando coberturas…</p>;
  if (!cards.length) {
    return <p className="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-ink-700">As coberturas deste plano não estão disponíveis agora.</p>;
  }

  const included = cards.filter((c) => c.status === "incluida");
  const available = cards.filter((c) => c.status === "disponivel");
  const locked = cards.filter((c) => c.status === "indisponivel");

  const renderCard = (card: CoverageCard) => {
    const on = card.status === "incluida";
    const canToggle = on ? card.actions.includes("remover") : card.actions.includes("adicionar");
    const range = on ? rangeText(card) : null;
    return (
      <li key={card.code}>
        <div
          onClick={() => canToggle && !busyCode && toggle(card)}
          role={canToggle ? "button" : undefined}
          tabIndex={canToggle ? 0 : undefined}
          onKeyDown={(e) => {
            if (canToggle && !busyCode && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              toggle(card);
            }
          }}
          className={cn(
            "flex min-h-14 w-full items-start justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
            canToggle && "cursor-pointer",
            on ? "border-brand-200 bg-white hover:border-brand-300" : "border-slate-200 bg-slate-50/70",
            card.status === "indisponivel" && "opacity-60",
          )}
          aria-label={`${card.name}. ${on ? "Incluída" : card.status === "disponivel" ? "Disponível para incluir" : "Indisponível"}${card.lock_reason ? `. ${card.lock_reason}` : ""}`}
        >
          <div className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-600">
              {GROUP_LABEL[card.group]}
              {card.origin === "adicionada_cliente" && <span className="rounded-full bg-brand-50 px-1.5 text-brand-700">incluída por você</span>}
              {!on && card.suggested && <span className="rounded-full bg-amber-50 px-1.5 text-amber-800">sugerida</span>}
            </span>
            <span className={cn("block text-sm font-semibold", on ? "text-brand-950" : "text-ink-700")}>{card.name}</span>
            {range && <span className="mt-0.5 block text-xs text-ink-600">{range}</span>}
            {card.warning && <span className="mt-0.5 block text-xs text-amber-800">{card.warning}</span>}
            {card.lock_reason && (
              <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-600">
                <Lock className="size-3" aria-hidden="true" />
                {card.lock_reason}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center pt-1" onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={on}
              disabled={!canToggle || busyCode !== null}
              onCheckedChange={() => toggle(card)}
              aria-label={`${on ? "Remover" : "Incluir"} ${card.name}`}
            />
          </div>
        </div>
      </li>
    );
  };

  const section = (title: string, list: CoverageCard[]) =>
    list.length > 0 && (
      <>
        <li className="my-3 flex items-center gap-2 pt-1" aria-hidden="true">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">{title}</span>
          <div className="h-px flex-1 bg-slate-200" />
        </li>
        {list.map(renderCard)}
      </>
    );

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-ink-600">
        <span>{included.length} coberturas incluídas</span>
        {personalized && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busyCode !== null}
            onClick={() => void send({ reset: true }, "__reset")}
            className="h-7 rounded-full px-2 text-xs"
          >
            <RotateCcw className="mr-1 size-3" aria-hidden="true" />
            Oferta padrão
          </Button>
        )}
      </div>
      {personalized && personalized.diff_vs_best.length > 0 && (
        <ul className="mb-3 rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-900" aria-label="Mudanças em relação à sugestão">
          {personalized.diff_vs_best.map((line) => <li key={line}>{line}</li>)}
        </ul>
      )}
      <ul className="max-h-[460px] space-y-2 overflow-y-auto pr-1 pb-4 [scrollbar-width:thin]" aria-label="Coberturas desta oferta">
        {included.map(renderCard)}
        {section("Disponíveis para incluir", available)}
        {section("Não disponíveis neste plano", locked)}
        {assistances.length > 0 && (
          <>
            <li className="my-3 flex items-center gap-2 pt-1" aria-hidden="true">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">Assistências do plano</span>
              <div className="h-px flex-1 bg-slate-200" />
            </li>
            {assistances.map((name) => (
              <li key={name} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <span className="block text-[11px] font-medium text-ink-600">Assistência · vem no pacote do plano</span>
                <span className="block text-sm font-semibold text-brand-950">{name}</span>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
}
