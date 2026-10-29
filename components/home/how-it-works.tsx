import { Reveal } from "@/components/home/reveal";

const STEPS = [
  { title: "Conte sobre seu negócio", description: "Uma conversa com a assistente virtual para entender sua atividade e sua rotina." },
  { title: "Confirme o que importa", description: "Revise os dados e responda apenas o que ainda precisamos saber." },
  { title: "Entenda suas opções", description: "Conheça as proteções recomendadas e o motivo de cada escolha." },
];

export function HowItWorks() {
  return (
    <ol aria-label="Como funciona a descoberta da sua proteção" className="mt-14 grid gap-8 border-t border-brand-900/10 pt-8 md:grid-cols-3 md:gap-10">
      {STEPS.map((step, index) => (
        <li key={step.title}>
          <Reveal delay={index * 0.08}>
            <span aria-hidden="true" className="text-sm font-medium text-brand-700">0{index + 1}</span>
            <h3 className="mt-3 text-base font-semibold text-brand-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.description}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
