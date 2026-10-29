import { AbsoluteFill, useCurrentFrame } from "remotion";
import { easeInOut, progress, reveal, sceneFade } from "../components/anim";
import { Backdrop } from "../components/Backdrop";
import { Sfx } from "../components/Sfx";
import { Title } from "../components/Type";
import { C, FONT } from "../theme";
import type { SceneProps } from "./types";

/*
 * CENA 02 — O problema. Um formulário tradicional (ilustrativo) ganha campos
 * até ficar sufocante; a frase central aparece; os campos se dissolvem e
 * sobra uma pergunta simples, que faz a ponte com a apresentação.
 */

const MAIN = ["Importância segurada", "Coberturas", "Valores dos bens", "Riscos"];

// Campos extras espalhados ao redor do formulário: [rótulo, x, y, profundidade 0–1].
const EXTRA: [string, number, number, number][] = [
  ["Limite máximo de indenização", 90, 110, 0.6],
  ["Franquia", 1420, 140, 0.8],
  ["Período indenitário", 1470, 330, 0.4],
  ["Classe de construção", 70, 330, 0.9],
  ["CNAE principal", 1450, 560, 0.7],
  ["Valor em risco declarado", 110, 560, 0.5],
  ["Cláusula de rateio", 1400, 780, 0.9],
  ["Bens de terceiros", 140, 790, 0.7],
  ["Sistemas protecionais", 560, 900, 0.3],
  ["Área construída (m²)", 1030, 920, 0.6],
  ["Lucros cessantes", 600, 40, 0.5],
  ["Equipamentos eletrônicos", 1030, 50, 0.8],
  ["Sinistros nos últimos 5 anos", 1180, 680, 0.2],
  ["Coberturas acessórias", 330, 690, 0.3],
];

function Field({ label, width = 520, size = 1 }: { label: string; width?: number; size?: number }) {
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 10 * size }}>
      <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 22 * size, color: "#33415F" }}>{label}</span>
      <div
        style={{
          height: 50 * size,
          borderRadius: 8,
          border: "2px solid #C9CFE3",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${16 * size}px`,
          fontFamily: FONT.body,
          fontSize: 20 * size,
          color: "#9AA2B8",
        }}
      >
        <span>Selecione…</span>
        <span>▾</span>
      </div>
    </div>
  );
}

export function S02Problema({ seconds }: SceneProps) {
  const frame = useCurrentFrame();
  const crowd = progress(frame, 3.0, 3.5, easeInOut);
  const scrim = progress(frame, 6.1, 0.9) * (1 - progress(frame, 9.0, 0.8));
  const dissolve = (i: number) => progress(frame, 8.6 + i * 0.07, 0.9, easeInOut);
  const panelOut = progress(frame, 9.2, 0.9, easeInOut);
  const simple = progress(frame, 9.9, 0.9);

  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, seconds, 0.6, 0.35) }}>
      <Backdrop glow={0.7} />

      {/* Campos extras */}
      {EXTRA.map(([label, x, y, depth], i) => {
        const appear = progress(frame, 3.0 + i * 0.22, 0.7);
        const out = dissolve(i);
        const scale = 0.72 + 0.28 * depth;
        const away = (x + 190 - 960) * 0.25 * out;
        const awayY = (y + 50 - 540) * 0.25 * out;
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              padding: "18px 22px",
              borderRadius: 14,
              background: "#F4F6FC",
              boxShadow: "0 20px 50px -24px rgba(0,0,0,0.7)",
              opacity: appear * (1 - out) * (0.55 + 0.45 * depth),
              transform: `translate(${away}px, ${awayY + (1 - appear) * 20}px) scale(${scale}) rotate(${(i % 3) - 1}deg)`,
              filter: `blur(${(1 - depth) * 2.4 + out * 8}px)`,
            }}
          >
            <Field label={label} width={340} size={0.9} />
          </div>
        );
      })}

      {/* Formulário tradicional */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 660,
            padding: "40px 48px 44px",
            borderRadius: 22,
            background: "#FFFFFF",
            boxShadow: "0 40px 120px -30px rgba(0,0,0,0.8)",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            ...reveal(frame, 0.2, 0.9, 30),
            opacity: progress(frame, 0.2, 0.9) * (1 - panelOut),
            transform: `scale(${1 - 0.04 * crowd + 0.02 * panelOut})`,
            filter: panelOut > 0 ? `blur(${panelOut * 10}px)` : undefined,
          }}
        >
          <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 30, color: C.brand900, letterSpacing: "-0.02em" }}>
            Cotação de seguro empresarial
          </div>
          {MAIN.map((label, i) => {
            const p = progress(frame, 0.9 + i * 0.55, 0.6);
            return (
              <div key={label} style={{ opacity: p * (1 - dissolve(i + 3)), transform: `translateY(${(1 - p) * 14}px)` }}>
                <Field label={label} width={564} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Frase central */}
      <AbsoluteFill style={{ background: `rgba(4, 10, 30, ${0.72 * scrim})` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Title start={6.5} end={8.9} size={96}>
          Proteger não deveria
          <br />
          ser <span style={{ color: C.sun }}>complicado.</span>
        </Title>
      </AbsoluteFill>

      {/* Sobra uma pergunta simples */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 760,
            padding: "34px 40px",
            borderRadius: 24,
            background: "#FFFFFF",
            border: `3px solid ${C.brand600}`,
            opacity: simple,
            transform: `translateY(${(1 - simple) * 18}px)`,
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

      {MAIN.map((_, i) => (
        <Sfx key={i} name="tick" at={0.9 + i * 0.55} volume={0.35} />
      ))}
      <Sfx name="whoosh" at={8.7} volume={0.45} />
    </AbsoluteFill>
  );
}
