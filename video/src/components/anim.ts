import { Easing, interpolate } from "remotion";
import { FPS } from "../timeline";

/* Animações determinísticas: tudo é função do quadro atual. */

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Progresso 0→1 entre `start` e `start + dur` (segundos), com easing. */
export function progress(frame: number, start: number, dur: number, easing = easeOut) {
  return interpolate(frame, [start * FPS, (start + dur) * FPS], [0, 1], { ...clamp, easing });
}

/** Entrada suave: sobe alguns pixels, ganha nitidez e opacidade. */
export function reveal(frame: number, start: number, dur = 0.8, distance = 24) {
  const p = progress(frame, start, dur);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance}px)`,
    filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
  } as const;
}

/** Saída suave a partir de `start`. */
export function exit(frame: number, start: number, dur = 0.6) {
  if (!Number.isFinite(start)) return 1;
  return 1 - progress(frame, start, dur, easeInOut);
}

/** Fade de entrada e saída da cena inteira (segundos). */
export function sceneFade(frame: number, seconds: number, fadeIn = 0.6, fadeOut = 0.6) {
  return Math.min(progress(frame, 0, fadeIn, easeInOut), 1 - progress(frame, seconds - fadeOut, fadeOut, easeInOut));
}

export interface CamKey {
  /** Segundo da cena. */
  t: number;
  /** Ponto de foco em pixels da captura (1440 × 810). */
  x: number;
  y: number;
  /** Aproximação (1 = aparelho inteiro na tela). */
  z: number;
}

/** Interpola a câmera entre chaves, sempre com aceleração e frenagem suaves. */
export function cameraAt(keys: CamKey[], t: number): Omit<CamKey, "t"> {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const p = easeInOut((t - a.t) / Math.max(0.001, b.t - a.t));
      // Interpola a escala em log para o movimento parecer constante.
      const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * p);
      return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, z };
    }
  }
  return keys[keys.length - 1];
}
