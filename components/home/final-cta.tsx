import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HowItWorks } from "@/components/home/how-it-works";
import { Reveal } from "@/components/home/reveal";
import { Button } from "@/components/ui/button";
import { ROUTES, SECTION_IDS } from "@/lib/site";
import entrepreneurs from "@/public/geniobb/hero-empreendedores.jpg";

export function FinalCta() {
  return (
    <section id={SECTION_IDS.howItWorks} aria-labelledby="cta-final-title" className="container-page pb-20 md:pb-28">
      <div className="rounded-3xl border border-brand-100 bg-white p-6 sm:p-9 md:p-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <Reveal>
            <p className="mb-5 text-sm font-medium text-brand-800">Uma conversa. Um novo olhar para o seu negócio.</p>
            <h2 id="cta-final-title" className="max-w-xl text-3xl leading-[1.2] font-semibold tracking-[-0.045em] text-brand-950 md:text-[2.65rem]">
              A proteção certa começa quando <span className="text-brand-700">entendemos o seu negócio.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600">
              O Negócio de Pé conecta o que você conta às necessidades da sua empresa. Uma descoberta inteligente, com escolhas explicadas e espaço para você revisar tudo.
            </p>
            <Button asChild variant="highlight" size="xl" className="mt-7 h-14 max-w-full rounded-full px-3 text-sm sm:px-6 sm:text-base">
              <Link href={ROUTES.profile}>
                Descobrir minha proteção
                <ArrowRight aria-hidden="true" className="motion-safe:transition-transform motion-safe:group-hover/button:translate-x-1" />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.12}>
            <Image
              src={entrepreneurs}
              alt="Dois empreendedores em seu estabelecimento comercial"
              placeholder="blur"
              sizes="(min-width: 1024px) 400px, (min-width: 768px) 640px, 90vw"
              className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-[4/5]"
            />
          </Reveal>
        </div>
        <HowItWorks />
      </div>
    </section>
  );
}
