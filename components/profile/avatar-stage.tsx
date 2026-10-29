"use client";

import { useState } from "react";
import { GenioBB } from "@/components/profile/genio-bb";
import type { GenioMood, GenioSignal } from "@/components/profile/use-genio-animation";
import { cn } from "@/lib/utils";

interface AvatarStageProps {
  signal: GenioSignal;
  variant?: "full" | "compact" | "sidebar";
  className?: string;
}

const LABELS: Record<GenioMood, string> = {
  IDLE: "Ouvindo",
  GREETING: "Olá!",
  LISTENING: "Ouvindo",
  THINKING: "Pensando...",
  EXPLAINING: "Explicando",
  IDEA: "Encontrei uma ideia!",
  CELEBRATING: "Muito bem!",
};

export function AvatarStage({ signal, variant = "full", className }: AvatarStageProps) {
  const compact = variant === "compact";
  const [activeMood, setActiveMood] = useState<GenioMood>("IDLE");

  return (
    <div className={cn(compact ? "flex items-center gap-3" : "flex flex-col", className)}>
      <div className={cn("relative grid shrink-0 place-items-center overflow-hidden bg-[#FDEE4F]", compact ? "w-20 rounded-xl" : "w-full rounded-2xl")}>
        <GenioBB signal={signal} onMoodChange={setActiveMood} responsive={variant === "compact" ? "mobile" : "desktop"} />
      </div>
      <div className={cn("min-w-0", compact ? "hidden min-[400px]:block" : "mt-2")}>
        <p className={cn("font-heading font-semibold text-brand-900", compact ? "text-sm" : "text-base")}>Seu guia virtual</p>
        <p className="text-xs text-ink-600" role="status">{LABELS[activeMood]}</p>
      </div>
    </div>
  );
}
