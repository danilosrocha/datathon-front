"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronRight, Pencil, Trash2 } from "lucide-react";

import { AnswerInput } from "@/components/profile/answer-input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Card, FactStatus, FactValue } from "@/lib/api/types";
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/case/presentation";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<Exclude<FactStatus, "rejeitado">, string> = {
  observado: "bg-brand-100 text-brand-800",
  derivado: "bg-brand-100 text-brand-800",
  estimado: "border border-dashed border-sun-400 bg-sun-400/25 text-brand-900",
  confirmado: "bg-mint-400/35 text-brand-900",
};

interface FactCardProps {
  card: Card;
  highlight?: "novo" | "atualizado";
  showInlineActions?: boolean;
  onEdit: (key: string, value: FactValue) => void;
  onConfirm: (key: string) => void;
  onRemove: (key: string) => void;
}

export function FactCard({ card, highlight, showInlineActions, onEdit, onConfirm, onRemove }: FactCardProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const status = card.status === "rejeitado" ? "confirmado" : card.status;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setEditing(false);
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "rounded-xl border bg-white transition-[border-color,box-shadow]",
        highlight && "border-brand-500 ring-2 ring-brand-200 motion-safe:animate-in motion-safe:fade-in-0",
        !highlight && "border-slate-200 hover:border-brand-300"
      )}
    >
      <div className="flex flex-col p-3">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <div className="flex items-center justify-between gap-3">
            <PopoverTrigger asChild>
              <button
                type="button"
                className="group flex min-w-0 flex-1 items-center justify-between gap-2 text-left outline-none focus-visible:underline"
                aria-label={`${card.label}: ${card.display_value}. ${STATUS_LABELS[status]}. Ver detalhes`}
              >
                <div className="min-w-0 flex-1">
                  <span className="block text-xs text-ink-600">{card.label}</span>
                  <span className="block truncate text-sm font-semibold text-ink-800">{card.display_value}</span>
                </div>
                <ChevronRight className="size-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            </PopoverTrigger>

            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLES[status])}>
              {STATUS_LABELS[status]}
            </span>
          </div>

          <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] space-y-3 p-4">
            <div>
              <p className="text-xs text-ink-600">{card.label}</p>
              <p className="font-heading text-lg font-semibold text-brand-900">{card.display_value}</p>
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="text-ink-600">Estado:</dt>
                <dd className="font-medium">{STATUS_LABELS[status]}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-ink-600">Fonte:</dt>
                <dd className="font-medium">{SOURCE_LABELS[card.source]}</dd>
              </div>
              {card.evidence && <dd className="rounded-md bg-brand-50 p-2 text-xs leading-relaxed text-ink-600">{card.evidence}</dd>}
            </dl>
            {status === "estimado" && (
              <p className="text-xs leading-relaxed text-ink-600">É uma estimativa: confirme ou corrija para deixar a recomendação mais precisa.</p>
            )}

            {editing && card.editable ? (
              <AnswerInput
                input={card.editable}
                size="compact"
                initialValue={card.value}
                onSubmit={(value) => {
                  onEdit(card.key, value);
                  handleOpenChange(false);
                }}
              />
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {status !== "confirmado" && (
                  <Button
                    size="md"
                    onClick={() => {
                      onConfirm(card.key);
                      handleOpenChange(false);
                    }}
                  >
                    <Check data-icon="inline-start" />
                    Confirmar
                  </Button>
                )}
                {card.editable && (
                  <Button size="md" variant="outline" onClick={() => setEditing(true)}>
                    <Pencil data-icon="inline-start" />
                    Corrigir
                  </Button>
                )}
                <Button
                  size="md"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    onRemove(card.key);
                    handleOpenChange(false);
                  }}
                >
                  <Trash2 data-icon="inline-start" />
                  Remover
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Ações diretas no próprio card (quando estimado ou quando solicitado explicitamente) */}
        {(showInlineActions || status === "estimado") && (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
            {status !== "confirmado" && (
              <Button
                size="sm"
                onClick={() => onConfirm(card.key)}
                className="h-8 flex-1 rounded-lg bg-brand-600 text-xs font-medium text-white hover:bg-brand-700"
              >
                <Check className="mr-1 size-3.5" />
                Confirmar
              </Button>
            )}

            {card.editable && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setOpen(true);
                  setEditing(true);
                }}
                className="h-8 px-2.5 text-xs text-ink-700 hover:text-brand-900"
                aria-label="Editar"
                title="Editar informação"
              >
                <Pencil className="size-3.5" />
                <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(card.key)}
              className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remover"
              title="Remover informação"
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Remover</span>
            </Button>
          </div>
        )}
      </div>
    </motion.li>
  );
}
