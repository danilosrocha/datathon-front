"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";

import { ProtectionScene, type SceneKind } from "@/components/home/protection-scenes";
import { Reveal, revealEase } from "@/components/home/reveal";
import { Button } from "@/components/ui/button";
import { SECTION_IDS } from "@/lib/site";

const BENEFITS: { kind: SceneKind; title: string; description: string; category: string }[] = [
  { kind: "property", title: "O que você construiu merece cuidado.", description: "Possíveis coberturas para incêndio e danos ao patrimônio do seu estabelecimento.", category: "Incêndio e patrimônio" },
  { kind: "electrical", title: "Energia para seguir em frente.", description: "Proteções para danos elétricos que podem afetar a rotina da sua empresa.", category: "Danos elétricos" },
  { kind: "theft", title: "Cuidado com o que é seu.", description: "Opções para roubo e furto de bens, conforme as situações previstas no produto.", category: "Roubo e furto de bens" },
  { kind: "equipment", title: "Seu trabalho não para por aqui.", description: "Possibilidades de proteção para os equipamentos que fazem parte do seu dia a dia.", category: "Proteção de equipamentos" },
  { kind: "liability", title: "Proteção que olha ao redor.", description: "Responsabilidade civil para danos a terceiros nas situações cobertas pelo seguro.", category: "Responsabilidade civil" },
  { kind: "activity", title: "Cada negócio tem seu jeito.", description: "Sua atividade, seu espaço e sua rotina ajudam a entender quais proteções fazem sentido.", category: "Proteção para sua atividade" },
  { kind: "assistance", title: "Uma ajuda faz a diferença.", description: "Serviços como chaveiro e eletricista, conforme o pacote de assistências disponível.", category: "Assistências empresariais" },
  { kind: "support", title: "Clareza em cada conversa.", description: "Orientação para entender suas opções e os canais de atendimento disponíveis.", category: "Atendimento e suporte" },
];

function BenefitCard({ benefit, index, paused }: { benefit: (typeof BENEFITS)[number]; index: number; paused: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      ref={ref}
      aria-labelledby={`benefit-${benefit.kind}`}
      className={`protection-card protection-card--${benefit.kind}`}
      data-reveal=""
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={reducedMotion || paused ? undefined : { y: -5 }}
      transition={{ duration: reducedMotion || paused ? 0 : 0.55, delay: reducedMotion || paused ? 0 : (index % 3) * 0.07, ease: revealEase }}
    >
      <ProtectionScene kind={benefit.kind} playing={inView && !paused && reducedMotion === false} />
      <div className="protection-card-copy">
        <p className="mb-2 text-xs font-medium text-brand-800">{benefit.category}</p>
        <h3 id={`benefit-${benefit.kind}`} className="text-xl leading-snug font-semibold tracking-[-0.035em] text-brand-950 md:text-[23px]">{benefit.title}</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-600">{benefit.description}</p>
      </div>
    </motion.article>
  );
}

export function ProtectionBenefits() {
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <section id={SECTION_IDS.businesses} aria-labelledby="protections-title" className="container-page pt-16 pb-16 md:pt-24 md:pb-24">
      <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 id="protections-title" className="text-2xl font-semibold tracking-[-0.04em] text-brand-950 md:text-[2rem]">Um negócio. Muitos motivos para proteger.</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-600 md:text-base">Conheça exemplos de como um seguro empresarial pode fazer parte da sua rotina.</p>
        </div>
        <Button
          variant="ghost"
          size="md"
          className="h-11 rounded-full text-xs text-brand-900 motion-reduce:hidden"
          onClick={() => setPaused(!paused)}
          disabled={!!reducedMotion}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          {paused ? "Retomar animações" : "Pausar animações"}
        </Button>
      </Reveal>
      <div className="protection-grid">
        {BENEFITS.map((benefit, index) => <BenefitCard key={benefit.kind} benefit={benefit} index={index} paused={paused} />)}
      </div>
      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-ink-600">
        Exemplos ilustrativos de proteções possíveis, sujeitos à elegibilidade, às condições e às coberturas dos produtos efetivamente disponíveis.
        Coberturas podem prever indenização por eventos cobertos; assistências são serviços previstos no pacote contratado.
      </p>
    </section>
  );
}
