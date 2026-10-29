import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { progress, reveal, sceneFade } from "../components/anim";
import { Backdrop } from "../components/Backdrop";
import { Sfx } from "../components/Sfx";
import { C, FONT } from "../theme";
import { pick, type SceneProps } from "./types";

/*
 * CENA 07 — Inteligência com responsabilidade. A IA conduz a conversa; as
 * regras de negócio decidem elegibilidade e coberturas; as duas levam a
 * recomendações explicáveis. A IA nunca aparece decidindo regra.
 */
export function S07Arquitetura({ cut, seconds }: SceneProps) {
  const frame = useCurrentFrame();
  const T = pick(cut, {
    full: { ai: 1.3, rules: 4.2, lines: 6.6, out: 7.3 },
    short: { ai: 0.5, rules: 2.6, lines: 4.2, out: 4.7 },
  });
  const line = progress(frame, T.lines, 1.0);

  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, seconds, 0.6, 0.6) }}>
      <Backdrop glow={0.8} />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {[
          "M 510 560 C 510 650, 700 650, 780 712",
          "M 1410 560 C 1410 650, 1220 650, 1140 712",
        ].map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={C.sun}
            strokeOpacity={0.75}
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - line}
          />
        ))}
      </svg>

      <Node
        start={T.ai}
        left={200}
        top={250}
        accent={C.brand500}
        icon={<ChatIcon />}
        title="IA"
        subtitle="Conduz a conversa"
      />
      <Node
        start={T.rules}
        left={1100}
        top={250}
        accent={C.sun}
        icon={<RulesIcon />}
        title="Regras de negócio"
        subtitle="Determinam elegibilidade e coberturas"
      />

      <div
        style={{
          position: "absolute",
          left: 610,
          top: 700,
          width: 700,
          padding: "34px 40px",
          borderRadius: 26,
          background: C.white,
          display: "flex",
          alignItems: "center",
          gap: 26,
          boxShadow: "0 30px 90px -30px rgba(0,0,0,0.75)",
          ...reveal(frame, T.out, 0.9, 24),
        }}
      >
        <span style={{ width: 72, height: 72, borderRadius: 20, background: C.sun, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.brand900} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3z" />
            <path d="m8.5 12 2.5 2.5 4.5-5" />
          </svg>
        </span>
        <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 46, color: C.brand900, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Recomendações explicáveis
        </span>
      </div>

      <Sfx name="pop" at={T.ai} volume={0.4} />
      <Sfx name="pop" at={T.rules} volume={0.4} />
      <Sfx name="confirm" at={T.out} volume={0.5} />
    </AbsoluteFill>
  );
}

function Node({
  start,
  left,
  top,
  accent,
  icon,
  title,
  subtitle,
}: {
  start: number;
  left: number;
  top: number;
  accent: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 620,
        height: 310,
        padding: "36px 40px",
        borderRadius: 28,
        background: "rgba(13, 24, 64, 0.85)",
        border: `2px solid ${accent}`,
        boxShadow: `0 30px 90px -40px ${accent}88`,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        ...reveal(frame, start, 0.9, 26),
      }}
    >
      <span style={{ width: 64, height: 64, borderRadius: 18, background: `${accent}26`, display: "grid", placeItems: "center" }}>{icon}</span>
      <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 52, color: C.white, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{title}</span>
      <span style={{ fontFamily: FONT.body, fontSize: 30, color: C.muted, lineHeight: 1.3 }}>{subtitle}</span>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.brand300} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" strokeWidth="3" />
    </svg>
  );
}

function RulesIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.sun} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" />
    </svg>
  );
}
