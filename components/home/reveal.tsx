"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export const revealEase = [0.22, 0.61, 0.36, 1] as const;

export function Reveal({ children, delay = 0, className, visibleOnLoad = false }: { children: ReactNode; delay?: number; className?: string; visibleOnLoad?: boolean }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      data-reveal=""
      initial={{ opacity: visibleOnLoad ? 1 : 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : delay, ease: revealEase }}
    >
      {children}
    </motion.div>
  );
}
