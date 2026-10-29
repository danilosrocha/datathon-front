import { cn } from "@/lib/utils";

interface LogoProps {
  tone?: "dark" | "light";
  className?: string;
  showWordmark?: boolean;
}

/** Marca do Negócio de Pé: uma fachada de comércio "de pé" sobre o amarelo de destaque. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-9 shrink-0", className)}>
      <rect width="32" height="32" rx="8" fill="var(--color-sun-400)" />
      <g
        fill="none"
        stroke="var(--color-brand-900)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 12 9.2 7h13.6L25 12" />
        <path d="M7 12a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
        <path d="M9 15.5V25h14v-9.5" />
        <path d="M14 25v-5.2h4V25" />
      </g>
    </svg>
  );
}

export function Logo({ tone = "dark", className, showWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span
          className={cn(
            "font-heading text-lg leading-none font-bold tracking-[-0.02em] whitespace-nowrap",
            tone === "dark" ? "text-white" : "text-brand-900",
          )}
        >
          Negócio <span className={tone === "dark" ? "text-sun-400" : "text-brand-600"}>de Pé</span>
        </span>
      )}
    </span>
  );
}
