"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import apresentacao from "@/public/geniobb/apresentacao-recorte.webp";
import { cn } from "@/lib/utils";

export interface AnimatedGenieProps {
  className?: string;
  interactive?: boolean;
}

/**
 * Animated Genie character for the Hero.
 * Positioned in the upper-right quadrant, performing a continuous, fluid zigzag flight.
 * Features:
 * - Playful zigzag diagonal trajectory with natural banking tilt
 * - Subtle breathing / life pulse
 * - Trailing magical stardust sparkles
 * - Interactive hover reaction
 */
export function AnimatedGenie({ className, interactive = true }: AnimatedGenieProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("relative select-none", className)}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Soft ambient blue & golden aura behind the character */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-full bg-[#003087]/15 blur-2xl animate-pulse"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-2 rounded-full bg-white/45 blur-lg"
        aria-hidden="true"
      />

      {/* Trailing stardust sparkles drifting in the wake of the zigzag */}
      {!reducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <motion.span
            className="absolute -bottom-1 left-8 text-xs text-brand-900/60 select-none"
            animate={{
              y: [0, 16, 28],
              x: [0, -8, -14],
              opacity: [0, 0.85, 0],
              scale: [0.6, 1, 0.4],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          >
            ✦
          </motion.span>
          <motion.span
            className="absolute bottom-2 left-1/2 text-sm text-[#003087]/75 select-none"
            animate={{
              y: [0, 18, 30],
              x: [0, 6, 12],
              opacity: [0, 0.9, 0],
              scale: [0.5, 1.1, 0.3],
            }}
            transition={{ duration: 2.6, repeat: Infinity, delay: 0.7, ease: "easeOut" }}
          >
            ✦
          </motion.span>
          <motion.span
            className="absolute bottom-4 right-10 text-xs text-brand-700/65 select-none"
            animate={{
              y: [0, 14, 24],
              x: [0, 7, 14],
              opacity: [0, 0.75, 0],
              scale: [0.7, 1, 0.5],
            }}
            transition={{ duration: 2.0, repeat: Infinity, delay: 1.3, ease: "easeOut" }}
          >
            ✦
          </motion.span>
        </div>
      )}

      {/* Zigzag flight motion in the upper right corner */}
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                x: [0, -48, 16, -62, 22, 0],
                y: [0, 24, 46, 20, -10, 0],
                rotate: [-2, 8, -6, 7, -3, -2],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 6.2,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        whileHover={
          interactive && !reducedMotion
            ? {
                scale: 1.08,
                rotate: -4,
                y: -14,
                transition: { duration: 0.3, ease: "easeOut" },
              }
            : undefined
        }
        className="relative cursor-pointer"
      >
        {/* Subtle breathing scale on the character */}
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  scale: [1, 1.025, 1, 1.015, 1],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          className="relative drop-shadow-[0_16px_26px_rgba(0,31,92,0.22)]"
        >
          <Image
            src={apresentacao}
            alt="Gênio do Negócio de Pé apontando para a proteção da sua empresa"
            priority
            sizes="(max-width: 640px) 130px, (max-width: 1024px) 190px, 250px"
            className="h-auto w-full object-contain pointer-events-none select-none"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
