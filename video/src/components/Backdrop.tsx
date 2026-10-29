import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { FPS } from "../timeline";

/**
 * Fundo cinematográfico: azul institucional profundo com dois brilhos suaves
 * da marca que derivam devagar (parallax discreto). Sem partículas.
 */
export function Backdrop({ glow = 1, drift = 1 }: { glow?: number; drift?: number }) {
  const t = useCurrentFrame() / FPS;
  const ax = 28 + Math.sin(t / 6) * 3 * drift;
  const ay = 30 + Math.cos(t / 7) * 2 * drift;
  const bx = 74 + Math.cos(t / 8) * 3 * drift;
  const by = 72 + Math.sin(t / 9) * 2 * drift;
  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(50% 55% at ${ax}% ${ay}%, rgba(90, 111, 255, ${0.22 * glow}), transparent 70%)`,
          `radial-gradient(45% 50% at ${bx}% ${by}%, rgba(0, 48, 135, ${0.55 * glow}), transparent 70%)`,
          `linear-gradient(180deg, ${C.deep} 0%, ${C.night} 100%)`,
        ].join(","),
      }}
    >
      {/* Vinheta para dar profundidade às bordas. */}
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
}
