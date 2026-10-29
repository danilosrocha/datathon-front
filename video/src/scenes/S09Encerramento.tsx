import { AbsoluteFill, useCurrentFrame } from "remotion";
import { easeInOut, progress, reveal, sceneFade } from "../components/anim";
import { Backdrop } from "../components/Backdrop";
import { Genio } from "../components/Genio";
import { Logo } from "../components/Logo";
import { Sfx } from "../components/Sfx";
import { C, FONT } from "../theme";
import { pick, type SceneProps } from "./types";

/** CENA 09 — Encerramento: o Gênio volta ao centro, a marca e a frase final. */
export function S09Encerramento({ cut, seconds }: SceneProps) {
  const frame = useCurrentFrame();
  const T = pick(cut, {
    full: { genie: 0.3, calm: 3.4, logo: 1.3, phrase: 3.8 },
    short: { genie: 0.1, calm: 2.6, logo: 0.6, phrase: 1.9 },
  });
  const genieIn = progress(frame, T.genie, 1.6, easeInOut);

  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, seconds, 0.5, 1.2) }}>
      <Backdrop glow={1.1} />

      <div
        style={{
          position: "absolute",
          left: 170,
          top: 250,
          opacity: genieIn,
          transform: `translateY(${(1 - genieIn) * 80}px) scale(${0.92 + 0.08 * genieIn})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 140,
            top: 40,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "radial-gradient(closest-side, rgba(252,238,79,0.3), transparent)",
          }}
        />
        <Genio
          width={800}
          moods={[
            { at: 0, mood: "CELEBRATING" },
            { at: T.calm, mood: "IDLE" },
          ]}
        />
      </div>

      <div style={{ position: "absolute", left: 1000, top: 370, width: 820, display: "flex", flexDirection: "column", gap: 40 }}>
        <div style={reveal(frame, T.logo, 1.0, 26)}>
          <Logo size={130} />
        </div>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 600,
            fontSize: 64,
            lineHeight: 1.1,
            letterSpacing: "-0.035em",
            color: C.white,
            textWrap: "balance",
            ...reveal(frame, T.phrase, 1.1, 24),
          }}
        >
          Seu negócio merece continuar <span style={{ color: C.sun }}>de pé.</span>
        </div>
      </div>

      <Sfx name="swell" at={T.genie} volume={0.5} />
      <Sfx name="confirm" at={T.logo + 0.1} volume={0.45} />
    </AbsoluteFill>
  );
}
