import type { CSSProperties } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import manifest from "../../public/genio/manifest.json";
import { FPS } from "../timeline";

/*
 * Gênio BB a partir dos quadros reais do produto (public/genio, copiados de
 * frontend/public/genio_bb_frames_webp). Os estados seguem os mesmos nomes da
 * aplicação (components/profile/use-genio-animation.ts) e a troca entre eles é
 * sempre um crossfade curto, sem saltos de posição.
 */

export type GenioMood = "IDLE" | "GREETING" | "THINKING" | "EXPLAINING" | "IDEA" | "CELEBRATING";

const ANIMATION: Record<GenioMood, string> = {
  IDLE: "01_flutuando",
  GREETING: "02_acenando",
  THINKING: "03_pensando",
  IDEA: "04_ideia",
  EXPLAINING: "05_apresentando",
  CELEBRATING: "06_comemorando",
};

// Deslocamentos medidos pela aplicação (centro do turbante, em 400 × 275) para
// manter o personagem no mesmo lugar entre animações.
const ALIGN: Record<string, [number, number]> = {
  "01_flutuando": [6, 2],
  "02_acenando": [-1, -1],
  "03_pensando": [-31, -5],
  "04_ideia": [-27, -4],
  "05_apresentando": [6, 2],
  "06_comemorando": [-3, 2],
};

const DETAILS = Object.fromEntries(manifest.animacoes.map((a) => [a.id, a]));
const CROSSFADE = 0.4;

function frameSrc(id: string, elapsed: number) {
  const info = DETAILS[id];
  const fps = info.frames / (info.duracao_s_sugerida ?? 1.2);
  const index = Math.floor(elapsed * fps) % info.frames;
  return staticFile(`genio/${id}/frame_${String(index + 1).padStart(3, "0")}.webp`);
}

export interface GenioProps {
  /** Linha do tempo de estados: a partir de `at` (segundos da cena), use `mood`. */
  moods: { at: number; mood: GenioMood }[];
  width: number;
  style?: CSSProperties;
  /** Amplitude da flutuação (fração da largura). */
  float?: number;
}

export function Genio({ moods, width, style, float = 0.006 }: GenioProps) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const height = (width * 1100) / 1600;
  const activeIndex = Math.max(0, moods.findLastIndex((m) => m.at <= t));
  const active = moods[activeIndex];
  const previous = activeIndex > 0 ? moods[activeIndex - 1] : null;
  const k = previous ? Math.min(1, (t - active.at) / CROSSFADE) : 1;
  const bob = Math.sin((2 * Math.PI * t) / 3.4) * width * float;

  const layer = (mood: GenioMood, startedAt: number, opacity: number) => {
    const id = ANIMATION[mood];
    const [dx, dy] = ALIGN[id];
    return (
      <Img
        key={`${id}-${startedAt}`}
        src={frameSrc(id, Math.max(0, t - startedAt))}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity,
          transform: `translate(${(dx / 400) * 100}%, ${(dy / 275) * 100}%)`,
        }}
      />
    );
  };

  return (
    <div style={{ position: "relative", width, height, transform: `translateY(${bob}px)`, ...style }}>
      {previous && k < 1 && layer(previous.mood, previous.at, 1 - k)}
      {layer(active.mood, active.at, k)}
    </div>
  );
}
