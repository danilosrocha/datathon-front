import { AbsoluteFill, useCurrentFrame } from "remotion";
import { easeInOut, progress, reveal } from "../components/anim";
import { Backdrop } from "../components/Backdrop";
import { Device, Spot, type Shot } from "../components/Device";
import { Sfx } from "../components/Sfx";
import { StatusPill } from "../components/Type";
import { C, FONT } from "../theme";
import { M } from "../timeline";
import { pick, type SceneProps } from "./types";

/*
 * CENA 05 — O momento WOW. Captura real: o usuário informa o CEP, o município
 * é identificado e o perfil ganha os cards de risco da região, marcados como
 * "Estimado". Depois, uma recapitulação animada do mesmo caminho, com os
 * valores exatos que a aplicação mostrou (modo demonstração).
 */

const cep = M["03-cep"];

function cutPlan(cut: "full" | "short") {
  const A: Shot = pick(cut, {
    full: { clip: "03-cep", from: 0.4, to: 11.0, at: 0 },
    short: { clip: "03-cep", from: 2.2, to: 9.4, at: 0 },
  });
  const B: Shot = { clip: "04-estoque", from: 0, to: 0, at: A.to - A.from };
  return { A, B };
}

export function S05Wow({ cut, seconds }: SceneProps) {
  const frame = useCurrentFrame();
  const { A, B } = cutPlan(cut);
  B.to = seconds - B.at + 0.05;
  const at = (mark: number) => A.at + (mark - A.from);
  const tSubmit = at(cep.submit);
  const tRisk = at(cep.riscos);
  const tVisible = at(cep["cards-visible"]);

  const T = pick(cut, {
    full: { enter: -1, recede: 8.6, steps: 9.2, gap: 0.6, emphasis: 12.0, back: 17.2 },
    short: { enter: 0, recede: 6.6, steps: 7.2, gap: 0.45, emphasis: 9.8, back: 13.4 },
  });

  const recede = progress(frame, T.recede, 1.3, easeInOut) * (1 - progress(frame, T.back, 1.6, easeInOut));
  const enter = T.enter >= 0 ? progress(frame, T.enter, 1.0, easeInOut) : 1;
  const steps = [T.steps, T.steps + T.gap, T.steps + 2 * T.gap];
  const tCards = T.steps + 3 * T.gap;
  const diagramOut = progress(frame, T.back - 0.2, 0.8, easeInOut);

  const camera = [
    ...(T.enter >= 0 ? [{ t: 0, x: 720, y: 405, z: 1 }, { t: 1.0, x: 520, y: 260, z: 1.55 }] : [{ t: 0, x: 520, y: 260, z: 1.55 }]),
    { t: tSubmit + 0.3, x: 520, y: 260, z: 1.55 },
    { t: tSubmit + 1.3, x: 1020, y: 560, z: 1.45 },
    { t: tRisk, x: 1040, y: 560, z: 1.5 },
    { t: T.recede, x: 1040, y: 565, z: 1.5 },
    { t: T.recede + 1.3, x: 720, y: 405, z: 1 },
  ];

  return (
    <AbsoluteFill>
      <Backdrop />
      <Device
        shots={[A, B]}
        camera={camera}
        dim={0.35 * recede}
        frameStyle={{
          opacity: enter,
          transform: `translate(${-500 * recede}px, ${(1 - enter) * 700}px) scale(${(1 - 0.38 * recede) * (0.88 + 0.12 * enter)})`,
        }}
      >
        <Spot x={940} y={714} w={322} h={90} start={tVisible} end={T.recede} />
      </Device>

      {/* Recapitulação: CEP → município → consulta regional → cards */}
      <div
        style={{
          position: "absolute",
          left: 1010,
          top: 150,
          width: 800,
          opacity: 1 - diagramOut,
          transform: `translateX(${diagramOut * 80}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 600,
            fontSize: 58,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            color: C.white,
            marginBottom: 40,
            ...reveal(frame, T.recede + 0.3, 0.9),
          }}
        >
          Um CEP. <span style={{ color: C.sun }}>Um perfil mais completo.</span>
        </div>

        <FlowStep index={1} start={steps[0]} label="CEP informado" value="01310-100" />
        <FlowLine start={steps[0] + 0.3} />
        <FlowStep index={2} start={steps[1]} label="Município identificado" value="São Paulo (SP)" pill="observado" />
        <FlowLine start={steps[1] + 0.3} />
        <FlowStep index={3} start={steps[2]} label="Consulta de dados da região" value="Histórico de clima e de desastres" />
        <FlowLine start={steps[2] + 0.3} />

        <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
          <RiskCard start={tCards} label="Vendaval na região" value="Médio" emphasis={T.emphasis} />
          <RiskCard start={tCards + 0.4} label="Alagamento na região" value="Baixo" emphasis={T.emphasis} />
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: FONT.body,
            fontSize: 22,
            lineHeight: 1.4,
            color: "rgba(229,232,255,0.6)",
            ...reveal(frame, T.emphasis + 0.4, 0.8, 10),
          }}
        >
          Estimativas por região, nunca apresentadas como fato.
          <br />
          Valores exibidos pelo protótipo em modo demonstração.
        </div>
      </div>

      <Sfx name="tick" at={tSubmit} volume={0.4} />
      <Sfx name="pop" at={at(cep.municipio)} volume={0.45} />
      <Sfx name="pop" at={tRisk} volume={0.5} />
      <Sfx name="whoosh" at={T.recede} volume={0.4} />
      {steps.map((s) => (
        <Sfx key={s} name="tick" at={s} volume={0.3} />
      ))}
      <Sfx name="pop" at={tCards} volume={0.5} />
      <Sfx name="pop" at={tCards + 0.4} volume={0.5} />
    </AbsoluteFill>
  );
}

function FlowStep({ index, start, label, value, pill }: { index: number; start: number; label: string; value: string; pill?: "observado" }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, ...reveal(frame, start, 0.7, 16) }}>
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: 99,
          background: "rgba(252,238,79,0.14)",
          border: `2px solid ${C.sun}`,
          color: C.sun,
          display: "grid",
          placeItems: "center",
          fontFamily: FONT.display,
          fontWeight: 600,
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        {index}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: FONT.body, fontSize: 22, color: "rgba(229,232,255,0.65)" }}>{label}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 34, color: C.white, letterSpacing: "-0.02em" }}>{value}</span>
          {pill && <StatusPill status={pill} scale={0.9} />}
        </span>
      </div>
    </div>
  );
}

function FlowLine({ start }: { start: number }) {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 0.5);
  return (
    <div style={{ marginLeft: 27, width: 2, height: 30, background: "rgba(252,238,79,0.5)", transform: `scaleY(${p})`, transformOrigin: "top" }} />
  );
}

/** Réplica do FactCard da aplicação, em escala de vídeo. */
function RiskCard({ start, label, value, emphasis }: { start: number; label: string; value: string; emphasis: number }) {
  const frame = useCurrentFrame();
  const pulse = progress(frame, emphasis, 0.6) * (1 - progress(frame, emphasis + 2.6, 0.8));
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 16,
        background: C.white,
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        boxShadow: `0 0 0 ${4 * pulse}px rgba(252,238,79,0.85), 0 24px 60px -24px rgba(0,0,0,0.6)`,
        ...reveal(frame, start, 0.7, 20),
      }}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: FONT.body, fontSize: 20, color: C.ink600 }}>{label}</span>
        <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 30, color: C.ink800 }}>{value}</span>
      </span>
      <span style={{ transform: `scale(${1 + 0.12 * pulse})` }}>
        <StatusPill status="estimado" />
      </span>
    </div>
  );
}
