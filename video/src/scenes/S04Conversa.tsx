import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Device, Spot, type Shot } from "../components/Device";
import { Sfx } from "../components/Sfx";
import { Callout } from "../components/Type";
import { M } from "../timeline";
import type { SceneProps } from "./types";

/*
 * CENA 04 — Uma conversa, não um formulário. Captura real: landing →
 * consentimento → primeira pergunta → "Restaurante" (o Gênio reage) → a
 * pergunta do CEP com "Por que pergunto isso?".
 */

const A: Shot = { clip: "01-home", from: 3.4, to: M["01-home"].duration, at: 0, rate: 1.5 };
const B: Shot = { clip: "02-atividade", from: 0.6, to: 5.1, at: 0 };
const C2: Shot = { clip: "02-atividade", from: 8.75, to: 13.0, at: 0 };
B.at = A.at + (A.to - A.from) / (A.rate ?? 1);
C2.at = B.at + (B.to - B.from);

/** Converte uma marca da captura no segundo da cena. */
const at = (shot: Shot, mark: number) => shot.at + (mark - shot.from) / (shot.rate ?? 1);

export function S04Conversa({ seconds }: SceneProps) {
  const h = M["01-home"];
  const a = M["02-atividade"];
  const tAnswer = at(B, a.answer);
  const tWhy = at(C2, a["why-open"]);
  const tWhyClose = at(C2, a["why-close"]);

  return (
    <AbsoluteFill>
      <Backdrop />
      <Device
        shots={[A, B, C2]}
        camera={[
          { t: 0, x: 720, y: 405, z: 1 },
          { t: at(A, h.consent) + 0.2, x: 720, y: 405, z: 1 },
          { t: at(A, h.consent) + 1.2, x: 720, y: 430, z: 1.1 },
          { t: at(A, h["start-chat"]), x: 720, y: 430, z: 1.1 },
          { t: at(A, h["first-question"]) + 0.2, x: 525, y: 300, z: 1.42 },
          { t: tAnswer + 0.2, x: 525, y: 300, z: 1.42 },
          { t: tAnswer + 1.1, x: 760, y: 400, z: 1.12 },
          { t: tAnswer + 2.0, x: 760, y: 400, z: 1.12 },
          { t: tAnswer + 3.0, x: 1080, y: 440, z: 1.45 },
          { t: C2.at, x: 1080, y: 440, z: 1.45 },
          { t: tWhy + 0.5, x: 650, y: 215, z: 1.9 },
          { t: tWhyClose - 0.2, x: 650, y: 215, z: 1.9 },
          { t: seconds, x: 520, y: 260, z: 1.55 },
        ]}
      >
        <Spot x={588} y={168} w={290} h={76} start={tWhy + 0.4} end={tWhyClose - 0.3} />
      </Device>

      <Callout start={tAnswer + 0.4} end={C2.at - 0.2} style={{ left: 96, top: 800 }}>
        Perguntamos apenas o <span style={{ color: "#FCEE4F" }}>necessário</span>.
      </Callout>
      <Callout start={tWhy + 0.7} end={tWhyClose - 0.2} style={{ left: 96, top: 800 }}>
        Cada pergunta explica o porquê.
      </Callout>

      <Sfx name="tick" at={at(A, h.click)} volume={0.4} />
      <Sfx name="tick" at={at(A, h.checked)} volume={0.4} />
      <Sfx name="tick" at={at(A, h["start-chat"])} volume={0.4} />
      <Sfx name="tick" at={tAnswer} volume={0.4} />
      <Sfx name="pop" at={tAnswer + 0.5} volume={0.45} />
      <Sfx name="tick" at={tWhy} volume={0.4} />
    </AbsoluteFill>
  );
}
