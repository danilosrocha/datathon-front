import { AbsoluteFill, useCurrentFrame } from "remotion";
import { exit, progress, reveal } from "../components/anim";
import { Backdrop } from "../components/Backdrop";
import { Device, Spot, type Shot } from "../components/Device";
import { Sfx } from "../components/Sfx";
import { Callout, StatusPill } from "../components/Type";
import { C, FONT } from "../theme";
import { M } from "../timeline";
import { pick, type SceneProps } from "./types";

/*
 * CENA 06 — Transparência e controle. Captura real: o card estimado do valor
 * do estoque é aberto (estado e fonte), o usuário escolhe "Corrigir", muda o
 * valor e o card passa a "Confirmado". A mudança é do usuário, não de uma
 * validação automática por fonte externa.
 */

const st = M["04-estoque"];

export function S06Controle({ cut, seconds }: SceneProps) {
  const frame = useCurrentFrame();
  const shot: Shot = pick(cut, {
    full: { clip: "04-estoque", from: 8.45, to: 21.05, at: 0, rate: 0.84 },
    short: { clip: "04-estoque", from: 7.85, to: 21.05, at: 0, rate: 1.2 },
  });
  const at = (mark: number) => (mark - shot.from) / (shot.rate ?? 1);
  const tOpen = at(st["card-open"]);
  const tFix = at(st.corrigir);
  const tConfirm = at(st.confirmado);
  const tVisible = at(st["confirmado-visible"]);

  const L = pick(cut, {
    full: { legend: [1.6, 3.6, 5.6], legendOut: 8.6 },
    short: { legend: [0.9, 2.2, 3.6], legendOut: 6.4 },
  });

  return (
    <AbsoluteFill>
      <Backdrop />
      <Device
        shots={[shot]}
        camera={[
          { t: 0, x: 720, y: 405, z: 1 },
          { t: Math.min(1.0, tOpen - 0.2), x: 1100, y: 560, z: 1.5 },
          { t: tOpen + 0.5, x: 1040, y: 560, z: 1.72 },
          { t: tFix, x: 1040, y: 560, z: 1.72 },
          { t: tFix + 0.7, x: 1060, y: 540, z: 1.5 },
          { t: tConfirm + 0.3, x: 1060, y: 540, z: 1.5 },
          { t: tVisible + 0.4, x: 990, y: 600, z: 1.55 },
          { t: seconds - 1.0, x: 990, y: 600, z: 1.55 },
          { t: seconds, x: 720, y: 405, z: 1.15 },
        ]}
        frameStyle={{ opacity: exit(frame, seconds - 0.7, 0.7) }}
      >
        <Spot x={946} y={456} w={334} h={112} start={tOpen + 0.9} end={tFix - 0.2} />
        <Spot x={940} y={690} w={322} h={64} start={tVisible} end={seconds - 0.5} color={C.mint} />
      </Device>

      {/* Os três estados de um fato */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 260,
          padding: "34px 38px",
          borderRadius: 24,
          background: C.white,
          boxShadow: "0 30px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(198,206,255,0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 26,
          opacity: progress(frame, L.legend[0] - 0.2, 0.6) * exit(frame, L.legendOut),
        }}
      >
        <LegendRow start={L.legend[0]} status="confirmado" text="Você confirmou" />
        <LegendRow start={L.legend[1]} status="observado" text="Veio de uma fonte" />
        <LegendRow start={L.legend[2]} status="estimado" text="Ainda precisa validar" />
      </div>

      {/* Estimado → Confirmado, pela mão do usuário */}
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 640,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "18px 26px",
          borderRadius: 18,
          background: C.white,
          boxShadow: "0 30px 80px -30px rgba(0,0,0,0.7)",
          ...reveal(frame, tConfirm + 0.2, 0.6, 14),
          opacity: progress(frame, tConfirm + 0.2, 0.6) * exit(frame, seconds - 0.7, 0.5),
        }}
      >
        <span style={{ opacity: 1 - 0.55 * progress(frame, tConfirm + 0.6, 0.5) }}>
          <StatusPill status="estimado" scale={1.15} />
        </span>
        <span style={{ fontFamily: FONT.display, fontSize: 34, color: C.brand600 }}>→</span>
        <span style={{ transform: `scale(${0.85 + 0.15 * progress(frame, tConfirm + 0.6, 0.5)})` }}>
          <StatusPill status="confirmado" scale={1.15} />
        </span>
        <span style={{ fontFamily: FONT.body, fontSize: 24, color: C.ink600, marginLeft: 6 }}>corrigido por você</span>
      </div>

      <Callout start={tConfirm + 0.5} end={seconds - 0.6} style={{ left: 96, top: 780 }} size={48}>
        Você sempre tem a <span style={{ color: C.sun }}>palavra final</span>.
      </Callout>

      <Sfx name="tick" at={tOpen} volume={0.4} />
      <Sfx name="tick" at={tFix} volume={0.4} />
      <Sfx name="confirm" at={tConfirm} volume={0.6} />
      {L.legend.map((s) => (
        <Sfx key={s} name="pop" at={s} volume={0.3} />
      ))}
    </AbsoluteFill>
  );
}

function LegendRow({ start, status, text }: { start: number; status: "confirmado" | "observado" | "estimado"; text: string }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, ...reveal(frame, start, 0.6, 14) }}>
      <span style={{ width: 230 }}>
        <StatusPill status={status} scale={1.25} />
      </span>
      <span style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: 34, color: C.brand900, letterSpacing: "-0.015em" }}>{text}</span>
    </div>
  );
}
