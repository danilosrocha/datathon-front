"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { AnimatedGenie } from "@/components/home/animated-genie";
import { Reveal } from "@/components/home/reveal";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/site";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  // Parallax sutil de scroll
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 36]);
  const genieY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.96, 0.9]);

  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-gradient-to-b from-[#FFF37A] via-[#FDEE4F] to-[#FCE833] text-center pt-16 pb-24 md:pt-24 md:pb-36"
    >
      {/* Grid sutil pontilhado retrô sobre o amarelo institucional */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(0,48,135,0.06)_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-80"
        aria-hidden="true"
      />

      {/* Iluminação suave e respiro central */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[420px] w-[700px] rounded-full bg-white/40 blur-[110px]"
        aria-hidden="true"
      />

      {/* Estrelas decorativas retrô em azul institucional */}
      <span aria-hidden="true" className="pointer-events-none absolute top-[20%] left-[8%] text-lg text-brand-900/25 animate-pulse">✦</span>
      <span aria-hidden="true" className="pointer-events-none absolute top-[68%] left-[10%] text-sm text-brand-900/20 animate-pulse [animation-delay:1s]">✦</span>
      <span aria-hidden="true" className="pointer-events-none absolute top-[18%] left-[22%] text-sm text-brand-900/20 animate-pulse [animation-delay:0.6s]">✦</span>

      {/* Gênio Animado: fixo no canto superior direito, com voo em zigzag e parallax de scroll */}
      <motion.div
        style={{ y: reducedMotion ? 0 : genieY }}
        className="pointer-events-auto absolute right-3 sm:right-6 md:right-10 lg:right-16 xl:right-24 top-4 sm:top-8 md:top-12 lg:top-14 w-24 sm:w-32 md:w-44 lg:w-52 xl:w-56 z-20"
      >
        <AnimatedGenie />
      </motion.div>

      {/* Conteúdo central da Hero */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-page relative z-10"
      >
        {/* Headline marcante e limpa */}
        <Reveal visibleOnLoad>
          <h1
            id="hero-title"
            className="mx-auto max-w-5xl text-[clamp(2.5rem,5.6vw,5.2rem)] leading-[1.1] font-semibold tracking-[-0.055em] text-brand-950"
          >
            Você faz acontecer.
            <br />
            <span className="text-brand-700">
              A proteção acompanha.
            </span>
          </h1>
        </Reveal>

        {/* Subtítulo */}
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-600 md:text-lg">
            Descubra as proteções que fazem sentido para o seu negócio continuar de pé.
          </p>
        </Reveal>

        {/* Botão de Ação CTA */}
        <Reveal delay={0.18}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <Button
              asChild
              size="xl"
              className="group h-14 rounded-full bg-brand-900 px-8 text-base font-semibold text-white shadow-lg shadow-brand-900/20 hover:bg-brand-950 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link href={ROUTES.profile}>
                Descobrir minha proteção
                <ArrowRight
                  aria-hidden="true"
                  className="ml-2 size-5 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </Button>
          </div>
        </Reveal>

        {/* Indicador de rolagem */}
        <div className="mt-14 flex flex-col items-center gap-1.5 text-xs text-brand-900/70 select-none">
          <span className="font-medium tracking-wide">Role para explorar</span>
          <div className="animate-bounce">
            <ChevronDown size={18} className="text-brand-900" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
