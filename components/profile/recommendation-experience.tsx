"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { CoverageCustomizer } from "@/components/profile/coverage-customizer";
import { GenioBB } from "@/components/profile/genio-bb";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { CaseState } from "@/lib/case/reducer";
import { USE_MOCKS } from "@/lib/case/transport";
import { cn } from "@/lib/utils";

const ANALYSIS_MS = 4800;
const OFFER_ORDER = ["melhor_ajuste", "custo_beneficio", "protecao_ampliada"] as const;

interface PlanDefinition {
  name: string;
  code: string;
  description: string;
  protections: string[];
  assistances: string[];
}

const BASE_PLANS: Record<string, PlanDefinition> = {
  ESSENCIAL: {
    name: "Plano Essencial",
    code: "ESSENCIAL",
    description: "Uma base de proteção para o patrimônio e a continuidade da operação.",
    protections: [
      "Incêndio, raio, explosão e fumaça",
      "Danos elétricos",
      "Perda ou pagamento de aluguel",
      "Responsabilidade civil do estabelecimento",
      "Despesas fixas",
      "Proteção cibernética",
    ],
    assistances: ["Empresa em Apuros", "Proteção Digital"],
  },
  PRATICO: {
    name: "Plano Prático",
    code: "PRATICO",
    description: "Amplia a proteção para bens e riscos que podem interromper a rotina.",
    protections: [
      "Incêndio, raio, explosão e fumaça",
      "Danos elétricos",
      "Perda ou pagamento de aluguel",
      "Responsabilidade civil do estabelecimento",
      "Despesas fixas",
      "Proteção cibernética",
      "Roubo ou furto mediante arrombamento",
      "Vendaval, furacão e granizo",
    ],
    assistances: [
      "Empresa em Apuros",
      "Proteção Digital",
      "Empresa Funcionando",
      "Empresa Arrumada",
      "Empresa Limpa",
    ],
  },
  TOTAL: {
    name: "Plano Total",
    code: "TOTAL",
    description: "Acrescenta proteções e assistências para uma operação mais ampla.",
    protections: [
      "Incêndio, raio, explosão e fumaça",
      "Danos elétricos",
      "Perda ou pagamento de aluguel",
      "Responsabilidade civil do estabelecimento",
      "Despesas fixas",
      "Proteção cibernética",
      "Roubo ou furto mediante arrombamento",
      "Vendaval, furacão e granizo",
      "Quebra de vidros",
      "Responsabilidade civil do empregador",
    ],
    assistances: [
      "Empresa em Apuros",
      "Proteção Digital",
      "Empresa Funcionando",
      "Empresa Arrumada",
      "Empresa Limpa",
      "Empresa Segura",
      "Empresa sem Pragas",
    ],
  },
};

type ServiceKind = "Cobertura" | "Assistência" | "Benefício";
interface Service { name: string; kind: ServiceKind }

// Composição padrão documentada em docs/CONTRATOS_API.md, §9.2.
const SERVICES: Service[] = [
  ...BASE_PLANS.TOTAL.protections.map((name) => ({ name, kind: "Cobertura" as const })),
  ...BASE_PLANS.TOTAL.assistances.map((name) => ({ name, kind: "Assistência" as const })),
  { name: "Benefício Premium", kind: "Benefício" },
];

const OFFER_COPY = {
  melhor_ajuste: { eyebrow: "Melhor ajuste", title: "O caminho que faz mais sentido", tone: "best" },
  custo_beneficio: { eyebrow: "Custo-benefício", title: "Uma opção mais enxuta", tone: "lean" },
  protecao_ampliada: { eyebrow: "Mais benefícios", title: "Para ampliar a proteção", tone: "wide" },
} as const;

export function RecommendationExperience({
  state,
  alreadySeen,
  onComplete,
  onReview,
}: {
  state: CaseState;
  alreadySeen: boolean;
  onComplete: () => void;
  onReview: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const startedAt = useRef(0);
  const [progress, setProgress] = useState(alreadySeen ? 100 : 0);

  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
  const [activeSideView, setActiveSideView] = useState<"detalhes" | "genio">("detalhes");
  // Mapa de itens personalizados por plano: planCode -> Record<serviceName, boolean>
  const [customizations, setCustomizations] = useState<Record<string, Record<string, boolean>>>({});

  const toggleService = (planCode: string, serviceName: string, defaultIncluded: boolean) => {
    setCustomizations((prev) => {
      const planCustom = prev[planCode] ?? {};
      const currentVal = planCustom[serviceName] ?? defaultIncluded;
      return {
        ...prev,
        [planCode]: {
          ...planCustom,
          [serviceName]: !currentVal,
        },
      };
    });
  };

  useEffect(() => {
    if (alreadySeen) return;
    if (!startedAt.current) startedAt.current = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const next = Math.min(state.recommendation ? 100 : 92, Math.round((elapsed / ANALYSIS_MS) * 100));
      setProgress((current) => Math.max(current, next));
    }, 60);
    return () => window.clearInterval(timer);
  }, [alreadySeen, state.recommendation]);

  useEffect(() => {
    if (progress === 100 && state.recommendation) onComplete();
  }, [onComplete, progress, state.recommendation]);

  const handleSelectPlan = (code: string) => {
    setSelectedPlanCode(code.toUpperCase());
    setActiveSideView("detalhes");
  };

  if (progress < 100 || !state.recommendation) {
    const step =
      progress < 34
        ? "Reunindo o que você contou"
        : progress < 70
          ? "Relacionando necessidades de proteção"
          : state.recommendation
            ? "Organizando suas opções"
            : "Aguardando a análise das opções";
    return (
      <div className="container-page flex min-h-0 flex-1 items-center justify-center overflow-y-auto py-6 sm:py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-brand-100 bg-white lg:grid-cols-[1fr_0.85fr]">
          <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:py-20">
            <p className="text-xs font-bold tracking-[0.12em] text-brand-600 uppercase">Seu perfil está completo</p>
            <h1 className="mt-4 max-w-lg font-heading text-4xl leading-tight font-semibold tracking-tight text-brand-950 sm:text-5xl">
              Agora vamos encontrar o melhor caminho para o seu negócio.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-600">
              Estamos organizando o que você nos contou para apresentar opções de proteção com clareza.
            </p>
            <div
              className="mt-10 max-w-md"
              role="progressbar"
              aria-label="Análise do perfil"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm font-medium text-brand-900" aria-live="polite">
                  {step}
                </span>
                <span className="font-heading text-2xl font-semibold tabular-nums text-brand-900">{progress}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-brand-100">
                <motion.div
                  className="h-full w-full rounded-full bg-[#5A6FFF]"
                  style={{ transformOrigin: "left" }}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeOut" }}
                />
              </div>
              <p className="mt-3 text-xs text-ink-600">As opções aparecem quando a análise estiver pronta.</p>
            </div>
          </div>
          <div className="flex min-h-72 items-end bg-[#FDEE4F] px-6 pt-8 sm:px-12 lg:min-h-[540px] lg:px-4">
            <GenioBB signal={{ scene: "analysis", ready: Boolean(state.recommendation) }} className="mx-auto max-w-[510px]" />
          </div>
        </div>
      </div>
    );
  }

  const offers = OFFER_ORDER.flatMap((kind) => state.recommendation!.offers.filter((offer) => offer.kind === kind));
  const activity = state.cards.atividade_efetiva?.display_value;
  const name = state.cards.razao_social?.display_value;
  const reason =
    state.cards.mercadoria_refrigerada?.value === true
      ? "Você contou que depende de mercadorias refrigeradas. Vale conferir as proteções específicas para essa rotina."
      : state.cards.possui_estoque?.value === true
        ? "Seu negócio mantém estoque no local. Por isso, vale comparar como cada plano trata a proteção dos bens."
        : "Consideramos sua atividade e a continuidade da operação ao organizar esta comparação.";
  const selectedOffer = offers.find((offer) => offer.plan_code.toUpperCase() === selectedPlanCode) ?? offers[0];
  const activePlanDef = selectedOffer ? BASE_PLANS[selectedOffer.plan_code.toUpperCase()] : undefined;
  const availablePlans = offers.map((offer) => BASE_PLANS[offer.plan_code.toUpperCase()]).filter((plan): plan is PlanDefinition => Boolean(plan));
  const services = SERVICES.filter((service) => availablePlans.some((plan) =>
    service.kind === "Cobertura" ? plan.protections.includes(service.name)
      : service.kind === "Assistência" ? plan.assistances.includes(service.name)
        : plan.code === "TOTAL"));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#F5F7FF]">
      <div className="container-page py-6 sm:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white p-5 sm:p-9 lg:p-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-brand-600 uppercase">
              <Sparkles className="size-4" aria-hidden="true" />
              {USE_MOCKS ? "Prévia demonstrativa" : "Sua recomendação"}
            </p>
            <Button variant="outline" size="sm" onClick={onReview} className="rounded-full border-brand-200 text-brand-900">
              <ArrowLeft data-icon="inline-start" />Rever respostas
            </Button>
          </div>

          <h1 className="mt-5 max-w-3xl font-heading text-3xl leading-tight font-semibold tracking-tight text-brand-950 sm:text-5xl">
            Seu negócio tem mais de um caminho para ficar de pé.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
            {name ? `Para ${name}, organizamos` : "Organizamos"} três formas de comparar proteção, da composição mais
            enxuta à mais ampla.{activity ? ` Atividade informada: ${activity}.` : ""}
          </p>

          <div className="mt-9 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.85fr)]">
            <div className="space-y-4">
              {offers.map((offer, index) => {
                const planCode = offer.plan_code.toUpperCase();
                const planDef = BASE_PLANS[planCode];
                const copy = OFFER_COPY[offer.kind];
                const isSelected = selectedOffer?.offer_id === offer.offer_id;
                return (
                  <motion.article
                    key={offer.offer_id}
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : index * 0.12 }}
                    onClick={() => handleSelectPlan(planCode)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectPlan(planCode);
                      }
                    }}
                    className={cn(
                      "cursor-pointer rounded-3xl border p-5 sm:p-6 transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      isSelected
                        ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 shadow-sm"
                        : "border-brand-100 bg-white hover:border-brand-300 hover:shadow-xs"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold tracking-[0.11em] text-brand-600 uppercase">{copy.eyebrow}</p>
                        <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-brand-950 sm:text-[1.7rem]">{copy.title}</h2>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-900 ring-1 ring-brand-100">{offer.title}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-700">{planDef?.description ?? "Confira a composição desta opção e as condições aplicáveis."}</p>
                    {offer.kind === "melhor_ajuste" && <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-sm leading-relaxed text-brand-900">{reason}</p>}
                    {planDef && (
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {planDef.protections.slice(0, 4).map((item) => <li key={item} className="flex items-start gap-2 text-sm text-ink-800"><Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />{item}</li>)}
                      </ul>
                    )}
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-100 pt-3">
                      <span className="text-xs text-ink-600">{planDef ? `${planDef.assistances.length} assistências no plano` : "Composição indisponível"}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? "secondary" : "outline"}
                        className="rounded-full text-xs font-medium pointer-events-none"
                        aria-label={`Ver serviços de ${offer.title}`}
                      >
                        Ver serviços <ChevronRight className="ml-1 size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <aside className="overflow-hidden rounded-3xl border border-brand-100 bg-white lg:sticky lg:top-4">
              <div className="flex border-b border-brand-100 bg-slate-50 p-1.5" role="group" aria-label="Informações da recomendação">
                <button type="button" onClick={() => setActiveSideView("detalhes")} aria-pressed={activeSideView === "detalhes"} className={cn("flex flex-1 items-center justify-center rounded-xl px-2 py-2 text-xs font-bold focus-visible:ring-2 focus-visible:ring-brand-500", activeSideView === "detalhes" ? "bg-white text-brand-900 shadow-xs" : "text-ink-600")}>Serviços do plano</button>
                <button type="button" onClick={() => setActiveSideView("genio")} aria-pressed={activeSideView === "genio"} className={cn("flex flex-1 items-center justify-center rounded-xl px-2 py-2 text-xs font-bold focus-visible:ring-2 focus-visible:ring-brand-500", activeSideView === "genio" ? "bg-white text-brand-900 shadow-xs" : "text-ink-600")}>Assistente virtual</button>
              </div>
              {activeSideView === "genio" ? (
                <div className="bg-[#FDEE4F]">
                  <div className="px-6 pt-7 sm:px-8 sm:pt-9">
                    <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-white text-brand-900"><ShieldCheck className="size-6" aria-hidden="true" /></div>
                    <p className="mt-5 font-heading text-2xl leading-tight font-semibold text-brand-950">Olhe as opções com calma.</p>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-brand-950">Eu reuni caminhos diferentes para você comparar o que faz sentido proteger no seu negócio.</p>
                    <Button size="sm" onClick={() => setActiveSideView("detalhes")} className="mt-4 rounded-full bg-brand-900 text-xs font-medium text-white hover:bg-brand-950">Explorar serviços <ChevronRight className="ml-1 size-3.5" /></Button>
                  </div>
                  <GenioBB signal={{ scene: "result", milestoneId: state.recommendation?.recommendation_id }} className="mt-5" />
                </div>
              ) : (
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold tracking-wider text-brand-600 uppercase">Personalização do plano</p>
                    {activePlanDef && customizations[activePlanDef.code] && Object.keys(customizations[activePlanDef.code]).length > 0 && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        Personalizado
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-heading text-xl font-bold text-brand-950">{activePlanDef?.name ?? selectedOffer?.title ?? "Serviços indisponíveis"}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-600">
                    {USE_MOCKS
                      ? "Ative ou desative coberturas e assistências para moldar o plano de acordo com as necessidades do seu negócio."
                      : "Clique numa cobertura para incluí-la ou retirá-la. As obrigatórias ficam sempre; as assistências vêm no pacote do plano."}
                  </p>
                  {!USE_MOCKS && selectedOffer ? (
                    <CoverageCustomizer
                      key={selectedOffer.offer_id}
                      caseId={state.recommendation!.case_id}
                      offerId={selectedOffer.offer_id}
                      initialCards={selectedOffer.coverage_cards}
                      assistances={activePlanDef?.assistances ?? []}
                      onCustomized={(offer) =>
                        setCustomizations((prev) => ({ ...prev, [selectedOffer.plan_code.toUpperCase()]: (offer ? { _api: true } : {}) as Record<string, boolean> }))
                      }
                    />
                  ) : activePlanDef ? (() => {
                    // Ordena: primeiro os habilitados/selecionados, depois os desabilitados
                    const sortedServices = [...services].sort((a, b) => {
                      const defA = a.kind === "Cobertura" ? activePlanDef.protections.includes(a.name)
                        : a.kind === "Assistência" ? activePlanDef.assistances.includes(a.name)
                          : activePlanDef.code === "TOTAL";
                      const incA = customizations[activePlanDef.code]?.[a.name] !== undefined
                        ? customizations[activePlanDef.code][a.name]
                        : defA;

                      const defB = b.kind === "Cobertura" ? activePlanDef.protections.includes(b.name)
                        : b.kind === "Assistência" ? activePlanDef.assistances.includes(b.name)
                          : activePlanDef.code === "TOTAL";
                      const incB = customizations[activePlanDef.code]?.[b.name] !== undefined
                        ? customizations[activePlanDef.code][b.name]
                        : defB;

                      if (incA === incB) return 0;
                      return incA ? -1 : 1;
                    });

                    const enabledCount = sortedServices.filter((s) => {
                      const def = s.kind === "Cobertura" ? activePlanDef.protections.includes(s.name)
                        : s.kind === "Assistência" ? activePlanDef.assistances.includes(s.name)
                          : activePlanDef.code === "TOTAL";
                      return customizations[activePlanDef.code]?.[s.name] !== undefined
                        ? customizations[activePlanDef.code][s.name]
                        : def;
                    }).length;

                    return (
                      <div className="relative mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs text-ink-600">
                          <span>{enabledCount} de {sortedServices.length} ativos</span>
                          <span className="flex items-center gap-1 text-[11px] text-ink-600 font-medium">
                            Role para ver mais <ChevronDown className="size-3 animate-bounce" />
                          </span>
                        </div>

                        <div className="relative">
                          <ul
                            className="max-h-[460px] space-y-2 overflow-y-auto pr-1 pb-4 [scrollbar-width:thin]"
                            aria-label="Todos os serviços desta comparação"
                          >
                            {sortedServices.map((service, index) => {
                              const defaultIncluded = service.kind === "Cobertura" ? activePlanDef.protections.includes(service.name)
                                : service.kind === "Assistência" ? activePlanDef.assistances.includes(service.name)
                                  : activePlanDef.code === "TOTAL";

                              const isCustomized = customizations[activePlanDef.code]?.[service.name] !== undefined;
                              const included = isCustomized ? customizations[activePlanDef.code][service.name] : defaultIncluded;
                              const status = included ? "Habilitado" : "Desabilitado";

                              // Adiciona um divisor discreto entre os itens ativos e inativos
                              const prevService = sortedServices[index - 1];
                              const prevIncluded = prevService ? (
                                customizations[activePlanDef.code]?.[prevService.name] !== undefined
                                  ? customizations[activePlanDef.code][prevService.name]
                                  : (prevService.kind === "Cobertura" ? activePlanDef.protections.includes(prevService.name)
                                    : prevService.kind === "Assistência" ? activePlanDef.assistances.includes(prevService.name)
                                      : activePlanDef.code === "TOTAL")
                              ) : true;
                              const isFirstDisabled = !included && prevIncluded;

                              return (
                                <li key={`${service.kind}:${service.name}`}>
                                  {isFirstDisabled && (
                                    <div className="my-3 flex items-center gap-2 pt-1">
                                      <div className="h-px flex-1 bg-slate-200" />
                                      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                                        Não selecionados
                                      </span>
                                      <div className="h-px flex-1 bg-slate-200" />
                                    </div>
                                  )}
                                  <div
                                    onClick={() => toggleService(activePlanDef.code, service.name, defaultIncluded)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggleService(activePlanDef.code, service.name, defaultIncluded);
                                      }
                                    }}
                                    className={cn(
                                      "flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                                      included ? "border-brand-200 bg-white hover:border-brand-300" : "border-slate-200 bg-slate-50/70 opacity-75 hover:bg-slate-50"
                                    )}
                                    aria-label={`${service.kind} ${service.name}. ${status}. Clique para ${included ? "desabilitar" : "habilitar"}`}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <span className="block text-[11px] font-medium text-ink-600">{service.kind}</span>
                                      <span className={cn("block text-sm font-semibold", included ? "text-brand-950" : "text-ink-700")}>
                                        {service.name}
                                      </span>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                      <Switch
                                        id={`switch-${activePlanDef.code}-${service.name}`}
                                        checked={included}
                                        onCheckedChange={() => toggleService(activePlanDef.code, service.name, defaultIncluded)}
                                        aria-label={`${included ? "Desabilitar" : "Habilitar"} ${service.name}`}
                                      />
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>

                          {/* Gradiente indicativo de rolagem na parte inferior */}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
                        </div>
                      </div>
                    );
                  })() : <p className="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-ink-700">A composição deste plano não está disponível para consulta.</p>}
                </div>
              )}
            </aside>
          </div>
          <p className="mt-7 max-w-3xl text-xs leading-relaxed text-ink-600">
            {USE_MOCKS ? "Esta é uma comparação ilustrativa do protótipo. " : ""}
            As proteções citadas são exemplos de composição. Coberturas, limites, assistências e contratação dependem
            das condições do produto e de avaliação. Não há valor de seguro calculado nesta tela; custo-benefício
            compara a amplitude das opções.
          </p>
        </div>
      </div>
    </div>
  );
}
