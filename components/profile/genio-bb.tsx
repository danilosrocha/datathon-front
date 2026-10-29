"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { firstGenioFrame, useGenioAnimation, type GenioMood, type GenioSignal } from "./use-genio-animation";

export function GenioBB({ signal, className, responsive, onMoodChange }: {
  signal: GenioSignal;
  className?: string;
  responsive?: "mobile" | "desktop";
  onMoodChange?: (mood: GenioMood) => void;
}) {
  const reducedMotion = Boolean(useReducedMotion());
  const [active, setActive] = useState(!responsive);

  useEffect(() => {
    if (!responsive) return;
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setActive(responsive === "desktop" ? query.matches : !query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [responsive]);

  const { imageRef, stageRef, activeMood } = useGenioAnimation(signal, reducedMotion, active);

  useEffect(() => { onMoodChange?.(activeMood); }, [activeMood, onMoodChange]);

  return (
    <div ref={stageRef} className={cn("pointer-events-none relative aspect-[16/11] w-full overflow-hidden", className)} aria-hidden="true">
      <Image
        ref={imageRef}
        src={firstGenioFrame()}
        alt=""
        width={1600}
        height={1100}
        draggable={false}
        unoptimized
        className="absolute inset-0 block h-full w-full select-none"
      />
    </div>
  );
}
