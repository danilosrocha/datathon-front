import script from "../narration/script.json";
import markers from "../public/capture/markers.json";
import { captionBlocks } from "./captions-core.mjs";
import durations from "./generated/narration-durations.json";

/*
 * Fonte única dos tempos. Cada versão (120 s e 60 s) é uma lista de cenas com
 * a duração em segundos; a narração usa os inícios absolutos de
 * narration/script.json. Para ajustar uma cena, mude a duração aqui e o
 * `start` das falas seguintes em script.json.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type Cut = "full" | "short";
export type SceneId =
  | "abertura"
  | "problema"
  | "apresentacao"
  | "conversa"
  | "wow"
  | "controle"
  | "arquitetura"
  | "recomendacoes"
  | "encerramento";

export const CUTS: Record<Cut, { id: SceneId; seconds: number }[]> = {
  full: [
    { id: "abertura", seconds: 10 },
    { id: "problema", seconds: 12 },
    { id: "apresentacao", seconds: 12 },
    { id: "conversa", seconds: 14 },
    { id: "wow", seconds: 19 },
    { id: "controle", seconds: 15 },
    { id: "arquitetura", seconds: 12 },
    { id: "recomendacoes", seconds: 14 },
    { id: "encerramento", seconds: 12 },
  ],
  short: [
    { id: "abertura", seconds: 7 },
    { id: "apresentacao", seconds: 6 },
    { id: "wow", seconds: 15 },
    { id: "controle", seconds: 11 },
    { id: "arquitetura", seconds: 8 },
    { id: "recomendacoes", seconds: 6 },
    { id: "encerramento", seconds: 7 },
  ],
};

export const cutSeconds = (cut: Cut) => CUTS[cut].reduce((sum, s) => sum + s.seconds, 0);

/** Início (s) de cada cena dentro da versão. */
export function sceneStarts(cut: Cut) {
  let t = 0;
  return CUTS[cut].map((scene) => {
    const start = t;
    t += scene.seconds;
    return { ...scene, start };
  });
}

export interface NarrationLine {
  id: string;
  cut: Cut;
  start: number;
  text: string;
  duration: number;
}

const DUR = durations as Record<string, number>;

export function narration(cut: Cut): NarrationLine[] {
  return (script.lines as Omit<NarrationLine, "duration">[])
    .filter((line) => line.cut === cut)
    .map((line) => ({ ...line, duration: DUR[line.id] ?? 0 }));
}

export function captions(cut: Cut): { start: number; end: number; text: string }[] {
  return captionBlocks(narration(cut), DUR);
}

/* ------------------------------ capturas reais ----------------------------- */

export type ClipName = keyof typeof markers;
export const M = markers;
export const sec = (s: number) => Math.round(s * FPS);
