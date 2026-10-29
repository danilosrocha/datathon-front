import { AbsoluteFill, useCurrentFrame } from "remotion";
import { easeInOut, exit, progress, reveal, sceneFade } from "../components/anim";
import { Backdrop } from "../components/Backdrop";
import { Device } from "../components/Device";
import { Genio } from "../components/Genio";
import { Logo } from "../components/Logo";
import { Sfx } from "../components/Sfx";
import { C, FONT } from "../theme";
import { pick, type SceneProps } from "./types";

/*
 * CENA 03 — Conheça o Negócio de Pé. O Gênio entra pela lateral, a marca se
 * apresenta e (na versão completa) a câmera desce até a landing page real,
 * que continua sem corte na cena seguinte.
 */
export function S03Apresentacao({ cut, seconds }: SceneProps) {
  const frame = useCurrentFrame();
  const T = pick(cut, {
    full: { bridgeOut: 0.2, genie: 0.5, brand: 1.4, sub: 3.6, out: 8.4, device: 8.5 },
    short: { bridgeOut: -1, genie: 0.1, brand: 0.6, sub: 2.0, out: 5.2, device: -1 },
  });

  const genieIn = progress(frame, T.genie, 1.8, easeInOut);
  const outP = progress(frame, T.out, 1.2, easeInOut);
  const deviceIn = T.device >= 0 ? progress(frame, T.device, 1.6, easeInOut) : 0;
  const fade = cut === "full" ? Math.min(1, sceneFade(frame, seconds + 1, 0.01, 0.01)) : sceneFade(frame, seconds, 0.6, 0.6);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop />

      {/* Ponte com a cena anterior: a pergunta simples recua */}
      {T.bridgeOut >= 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 760,
              padding: "34px 40px",
              borderRadius: 24,
              background: "#FFFFFF",
              border: `3px solid ${C.brand600}`,
              opacity: exit(frame, T.bridgeOut, 0.9),
              transform: `translateX(${-260 * progress(frame, T.bridgeOut, 1.2, easeInOut)}px) scale(${1 - 0.25 * progress(frame, T.bridgeOut, 1.2)})`,
              filter: `blur(${6 * progress(frame, T.bridgeOut, 1.2)}px)`,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 18, letterSpacing: "0.1em", color: C.brand600 }}>
              SOBRE O SEU NEGÓCIO
            </span>
            <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 40, color: C.brand900, letterSpacing: "-0.02em" }}>
              Para começar: qual é a atividade principal do seu negócio?
            </span>
          </div>
        </AbsoluteFill>
      )}

      {/* Gênio + marca */}
      <AbsoluteFill
        style={{
          opacity: 1 - outP,
          transform: `translateY(${-140 * outP}px) scale(${1 - 0.06 * outP})`,
          filter: outP > 0 ? `blur(${outP * 6}px)` : undefined,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 230,
            opacity: genieIn,
            transform: `translateX(${(1 - genieIn) * 420}px)`,
          }}
        >
          {/* Halo amarelo discreto atrás do personagem, como na aplicação */}
          <div
            style={{
              position: "absolute",
              left: 120,
              top: 40,
              width: 520,
              height: 520,
              borderRadius: 999,
              background: `radial-gradient(closest-side, rgba(252,238,79,0.28), transparent)`,
            }}
          />
          <Genio
            width={820}
            moods={[
              { at: 0, mood: "IDLE" },
              { at: T.brand + 0.2, mood: "GREETING" },
              { at: T.sub + 2.4, mood: "EXPLAINING" },
            ]}
          />
        </div>

        <div style={{ position: "absolute", left: 960, top: 360, width: 860, display: "flex", flexDirection: "column", gap: 34 }}>
          <div style={reveal(frame, T.brand, 1.0, 30)}>
            <Logo size={128} />
          </div>
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 500,
              fontSize: 46,
              lineHeight: 1.22,
              letterSpacing: "-0.02em",
              color: C.muted,
              textWrap: "balance",
              ...reveal(frame, T.sub, 1.0, 22),
            }}
          >
            Uma maneira mais inteligente de descobrir como proteger sua empresa.
          </div>
        </div>
      </AbsoluteFill>

      {/* A câmera chega à landing page real */}
      {T.device >= 0 && deviceIn > 0 && (
        <Device
          // Termina exatamente onde a cena 04 retoma a captura (3,4 s, antes do clique).
          shots={[{ clip: "01-home", from: 0, to: 3.4, at: T.device, rate: 3.4 / (seconds - T.device) }]}
          frameStyle={{
            opacity: deviceIn,
            transform: `translateY(${(1 - deviceIn) * 760}px) scale(${0.86 + 0.14 * deviceIn}) perspective(2400px) rotateX(${(1 - deviceIn) * 14}deg)`,
          }}
        />
      )}

      <Sfx name="whoosh" at={T.genie} volume={0.45} />
      <Sfx name="confirm" at={T.brand + 0.1} volume={0.5} />
      {T.device >= 0 && <Sfx name="whoosh" at={T.device} volume={0.4} />}
    </AbsoluteFill>
  );
}
