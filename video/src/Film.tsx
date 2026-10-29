import type { ComponentType } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { Captions } from "./components/Captions";
import { S01Abertura } from "./scenes/S01Abertura";
import { S02Problema } from "./scenes/S02Problema";
import { S03Apresentacao } from "./scenes/S03Apresentacao";
import { S04Conversa } from "./scenes/S04Conversa";
import { S05Wow } from "./scenes/S05Wow";
import { S06Controle } from "./scenes/S06Controle";
import { S07Arquitetura } from "./scenes/S07Arquitetura";
import { S08Recomendacoes } from "./scenes/S08Recomendacoes";
import { S09Encerramento } from "./scenes/S09Encerramento";
import type { SceneProps } from "./scenes/types";
import { C } from "./theme";
import { captions, type Cut, FPS, narration, sceneStarts, type SceneId, sec } from "./timeline";

const SCENES: Record<SceneId, ComponentType<SceneProps>> = {
  abertura: S01Abertura,
  problema: S02Problema,
  apresentacao: S03Apresentacao,
  conversa: S04Conversa,
  wow: S05Wow,
  controle: S06Controle,
  arquitetura: S07Arquitetura,
  recomendacoes: S08Recomendacoes,
  encerramento: S09Encerramento,
};

export type FilmProps = {
  cut: Cut;
  showCaptions: boolean;
};

/** Monta uma versão: cenas em sequência, narração, trilha com ducking e legendas. */
export function Film({ cut, showCaptions }: FilmProps) {
  const lines = narration(cut);

  // A trilha abaixa enquanto há locução, com rampas de 0,4 s.
  const musicVolume = (frame: number) => {
    const t = frame / FPS;
    let duck = 0;
    for (const line of lines) {
      const d = Math.min(
        interpolate(t, [line.start - 0.4, line.start], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        interpolate(t, [line.start + line.duration, line.start + line.duration + 0.6], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      );
      duck = Math.max(duck, d);
    }
    return 0.75 - 0.45 * duck;
  };

  return (
    <AbsoluteFill style={{ background: C.night }}>
      {sceneStarts(cut).map(({ id, start, seconds }) => {
        const Scene = SCENES[id];
        return (
          <Sequence key={id} name={id} from={sec(start)} durationInFrames={sec(seconds)}>
            <Scene cut={cut} seconds={seconds} />
          </Sequence>
        );
      })}

      <Audio src={staticFile(`audio/music-${cut}.wav`)} volume={musicVolume} />
      {lines.map((line) => (
        <Sequence key={line.id} name={`voz ${line.id}`} from={sec(line.start)} durationInFrames={sec(line.duration + 0.3)} layout="none">
          <Audio src={staticFile(`audio/narration/${line.id}.wav`)} volume={1} />
        </Sequence>
      ))}

      {showCaptions && <Captions blocks={captions(cut)} />}
    </AbsoluteFill>
  );
}
