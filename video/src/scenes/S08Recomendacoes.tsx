import { AbsoluteFill, useCurrentFrame } from "remotion";
import { easeInOut, exit, progress, reveal } from "../components/anim";
import { Backdrop } from "../components/Backdrop";
import { Device, type Shot } from "../components/Device";
import { Sfx } from "../components/Sfx";
import { C, FONT } from "../theme";
import { M } from "../timeline";
import { pick, type SceneProps } from "./types";

/*
 * CENA 08 — Recomendações. Captura real da análise e dos três caminhos.
 * A tela ainda é protótipo: o selo "Prévia demonstrativa" fica visível o
 * tempo todo, e nenhum preço, cotação, faixa ou cobertura extra é mostrado.
 */

const rec = M["05-recomendacao"];

export function S08Recomendacoes({ cut, seconds }: SceneProps) {
  const frame = useCurrentFrame();
  const shot: Shot = pick(cut, {
    full: { clip: "05-recomendacao", from: 1.0, to: 13.4, at: 0, rate: 0.88 },
    short: { clip: "05-recomendacao", from: 6.7, to: 12.75, at: 0 },
  });
  const at = (mark: number) => (mark - shot.from) / (shot.rate ?? 1);
  const tAnalysis = at(rec.analysis);
  const tOffers = at(rec.offers);
  const tScroll = at(rec.scroll);

  const enter = progress(frame, 0, 1.0, easeInOut);
  const leave = progress(frame, seconds - 0.8, 0.8, easeInOut);
  const chips = pick(cut, { full: [tOffers + 0.6, tOffers + 1.1, tOffers + 1.6], short: [1.0, 1.35, 1.7] });

  const camera =
    cut === "full"
      ? [
          { t: 0, x: 720, y: 405, z: 1 },
          { t: tAnalysis + 0.2, x: 720, y: 405, z: 1 },
          { t: tAnalysis + 1.2, x: 560, y: 440, z: 1.42 },
          { t: tOffers - 0.3, x: 560, y: 440, z: 1.42 },
          { t: tOffers + 0.6, x: 720, y: 405, z: 1.02 },
          { t: tScroll, x: 720, y: 405, z: 1.02 },
          { t: tScroll + 1.2, x: 520, y: 430, z: 1.22 },
          { t: seconds, x: 520, y: 430, z: 1.22 },
        ]
      : [
          { t: 0, x: 720, y: 405, z: 1 },
          { t: seconds, x: 620, y: 420, z: 1.12 },
        ];

  return (
    <AbsoluteFill>
      <Backdrop />
      <Device
        shots={[shot]}
        camera={camera}
        badge="Prévia demonstrativa"
        frameStyle={{
          opacity: enter * (1 - leave),
          transform: `translateY(${(1 - enter) * 640}px) scale(${(0.9 + 0.1 * enter) * (1 - 0.06 * leave)})`,
        }}
      />

      {/* Os três caminhos */}
      <div
        style={{
          position: "absolute",
          right: 90,
          top: 250,
          width: 520,
          padding: "34px 36px",
          borderRadius: 26,
          background: "rgba(4, 10, 30, 0.9)",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(198,206,255,0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          opacity: progress(frame, chips[0] - 0.3, 0.6) * exit(frame, seconds - 0.9, 0.6),
        }}
      >
        <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 20, letterSpacing: "0.12em", color: C.sun }}>
          TRÊS CAMINHOS PARA COMPARAR
        </span>
        {["Melhor ajuste", "Custo-benefício", "Mais benefícios"].map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 20, ...reveal(frame, chips[i], 0.6, 14) }}>
            <span
              style={{
                width: 50,
                height: 50,
                borderRadius: 99,
                display: "grid",
                placeItems: "center",
                background: i === 0 ? C.sun : "rgba(198,206,255,0.14)",
                color: i === 0 ? C.brand900 : C.white,
                fontFamily: FONT.display,
                fontWeight: 600,
                fontSize: 24,
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 40, color: C.white, letterSpacing: "-0.025em" }}>
              {label}
            </span>
          </div>
        ))}
        <span style={{ fontFamily: FONT.body, fontSize: 21, lineHeight: 1.4, color: "rgba(229,232,255,0.6)", ...reveal(frame, chips[2] + 0.5, 0.6, 8) }}>
          Composição ilustrativa do protótipo.
          <br />
          Sem preço, cotação ou contratação.
        </span>
      </div>

      {cut === "full" && <Sfx name="swell" at={tAnalysis} volume={0.7} />}
      {chips.map((c) => (
        <Sfx key={c} name="pop" at={c} volume={0.35} />
      ))}
    </AbsoluteFill>
  );
}
