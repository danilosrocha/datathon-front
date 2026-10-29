import { AbsoluteFill, useCurrentFrame } from "remotion";
import { progress, sceneFade } from "../components/anim";
import { Backdrop } from "../components/Backdrop";
import { Restaurant } from "../components/Restaurant";
import { Sfx } from "../components/Sfx";
import { Title } from "../components/Type";
import { C } from "../theme";
import { FPS } from "../timeline";
import { pick, type SceneProps } from "./types";

/** CENA 01 — O que mantém seu negócio de pé? (reflexão, não medo) */
export function S01Abertura({ cut, seconds }: SceneProps) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const T = pick(cut, {
    full: { structure: 0.3, equipment: 1.3, goods: 1.9, staff: 2.5, dim: 4.0, line1: 4.3, line2: 6.5 },
    short: { structure: 0.1, equipment: 0.5, goods: 0.8, staff: 1.1, dim: 1.5, line1: 1.6, line2: 3.3 },
  });

  const light = 1 - 0.75 * progress(frame, T.dim, 1.6);
  const focus = progress(frame, T.dim, 1.6);
  // Push-in lento e contínuo, com leve deriva lateral.
  const push = 1 + 0.07 * (t / seconds);
  const driftX = -12 * (t / seconds);

  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, seconds, 1.0, 0.7), background: C.night }}>
      <Backdrop glow={0.6 + 0.4 * light} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${driftX}px, ${-18 * focus}px) scale(${push - 0.06 * focus})`,
          filter: focus > 0 ? `blur(${focus * 3}px)` : undefined,
          opacity: 1 - 0.45 * focus,
        }}
      >
        <Restaurant timing={T} light={light} />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 18 }}>
        <Title start={T.line1} size={92} style={{ color: "rgba(255,255,255,0.92)" }}>
          Se algo acontecer amanhã…
        </Title>
        <Title start={T.line2} size={92}>
          O que mantém seu negócio <span style={{ color: C.sun }}>de pé?</span>
        </Title>
      </AbsoluteFill>

      <Sfx name="whoosh" at={T.line1 - 0.3} volume={0.5} />
    </AbsoluteFill>
  );
}
