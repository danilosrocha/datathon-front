"use client";

import Link from "next/link";
import { useId, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { CircleCheckBig, Info, Loader2, ShieldAlert } from "lucide-react";

import { AnswerInput } from "@/components/profile/answer-input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Eligibility, FactValue, Question } from "@/lib/api/types";
import { ROUTES } from "@/lib/site";

interface QuestionBarProps {
  question: Question | null;
  busy: boolean;
  finished: boolean;
  eligibility: Eligibility | null;
  onAnswer?: (value: FactValue) => void;
  variant?: "full" | "header" | "input";
}

/** Pergunta atual ou suas seções divididas para o layout Pergunta > Chat > Sugestões/Input. */
export function QuestionBar({ question, busy, finished, eligibility, onAnswer, variant = "full" }: QuestionBarProps) {
  const promptId = useId();
  const questionRef = useRef<HTMLElement>(null);
  const previousBusy = useRef(busy);

  useLayoutEffect(() => {
    const element = questionRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeline = gsap.timeline().fromTo(element,
      { opacity: 0, y: 10, scale: 0.99 },
      { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "power2.out" });
    return () => { timeline.kill(); gsap.killTweensOf(element); };
  }, [question?.question_id]);

  function submitAnswer(value: FactValue) {
    if (questionRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.timeline().to(questionRef.current, { opacity: 0.72, y: -5, duration: 0.18, ease: "power1.inOut" });
    }
    onAnswer?.(value);
  }

  useLayoutEffect(() => {
    if (previousBusy.current && !busy && questionRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(questionRef.current, { opacity: 1, y: 0, duration: 0.2, overwrite: true });
    }
    previousBusy.current = busy;
  }, [busy]);

  if (eligibility?.status === "inelegivel") {
    if (variant === "input") return null;
    return (
      <section aria-label="Situação do perfil" className="bg-white p-5 md:p-6">
        <p className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-900">
          <ShieldAlert className="size-5 text-coral-400" aria-hidden="true" />
          Este seguro não pode ser contratado agora
        </p>
        <ul className="mt-2 space-y-1 text-[15px] text-ink-600">
          {eligibility.blockers.map((blocker) => (
            <li key={blocker.rule_id}>{blocker.description}.</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-600">
          Isso não é uma avaliação sobre o seu negócio. Você pode voltar quando a situação mudar.
        </p>
        <Button asChild variant="outline" size="md" className="mt-4">
          <Link href={ROUTES.home}>Voltar para o início</Link>
        </Button>
      </section>
    );
  }

  if (finished) {
    if (variant === "input") return null;
    return (
      <section aria-label="Situação do perfil" className="bg-white p-5 md:p-6">
        <p className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-900">
          <CircleCheckBig className="size-5 text-brand-600" aria-hidden="true" />
          Perfil pronto para a recomendação
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
          Você pode revisar e corrigir as informações abaixo antes de voltar às opções de proteção.
        </p>
      </section>
    );
  }

  if (!question) {
    if (variant === "input") return null;
    return (
      <section aria-label="Pergunta atual" className="flex items-center gap-3 bg-white p-5 text-ink-600 md:p-6">
        <Loader2 className="size-5 animate-spin text-brand-600 motion-reduce:animate-none" aria-hidden="true" />
        Preparando a primeira pergunta…
      </section>
    );
  }

  if (variant === "header") {
    return (
      <section
        ref={questionRef}
        key={question.question_id}
        aria-labelledby={promptId}
        className="relative shrink-0 bg-white p-4 pb-3 md:p-6 md:pb-4"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold tracking-[0.08em] text-brand-600 uppercase">
            {question.style === "confirmacao" ? "Para confirmar" : "Sobre o seu negócio"}
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="-mr-2 text-ink-600 hover:text-brand-900">
                <Info data-icon="inline-start" />
                Por que pergunto isso?
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 text-sm leading-relaxed">
              {question.reason}
            </PopoverContent>
          </Popover>
        </div>
        <h2 id={promptId} className="text-lg leading-snug font-semibold text-brand-900 md:text-2xl">
          {question.prompt}
        </h2>
      </section>
    );
  }

  if (variant === "input") {
    return (
      <div key={`input-${question.question_id}`} className="space-y-3">
        <AnswerInput key={question.question_id} input={question.input} onSubmit={submitAnswer} disabled={busy} labelledBy={promptId} />
        {busy && (
          <p className="flex items-center gap-2 text-xs text-ink-600" role="status">
            <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Atualizando o seu perfil…
          </p>
        )}
      </div>
    );
  }

  return (
      <section
        ref={questionRef}
        key={question.question_id}
        aria-labelledby={promptId}
        className="relative shrink-0 bg-white p-4 md:p-6"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold tracking-[0.08em] text-brand-600 uppercase">
            {question.style === "confirmacao" ? "Para confirmar" : "Sobre o seu negócio"}
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="-mr-2 text-ink-600 hover:text-brand-900">
                <Info data-icon="inline-start" />
                Por que pergunto isso?
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 text-sm leading-relaxed">
              {question.reason}
            </PopoverContent>
          </Popover>
        </div>
        <h2 id={promptId} className="mb-3 text-lg leading-snug font-semibold text-brand-900 md:mb-4 md:text-2xl">
          {question.prompt}
        </h2>
        <AnswerInput key={question.question_id} input={question.input} onSubmit={submitAnswer} disabled={busy} labelledBy={promptId} />
        {busy && (
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-600" role="status">
            <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Atualizando o seu perfil…
          </p>
        )}
      </section>
  );
}
