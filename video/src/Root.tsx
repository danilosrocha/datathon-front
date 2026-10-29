import { Composition, Folder } from "remotion";
import { Film, type FilmProps } from "./Film";
import { S01Abertura } from "./scenes/S01Abertura";
import { S02Problema } from "./scenes/S02Problema";
import { S03Apresentacao } from "./scenes/S03Apresentacao";
import { S04Conversa } from "./scenes/S04Conversa";
import { S05Wow } from "./scenes/S05Wow";
import { S06Controle } from "./scenes/S06Controle";
import { S07Arquitetura } from "./scenes/S07Arquitetura";
import { S08Recomendacoes } from "./scenes/S08Recomendacoes";
import { S09Encerramento } from "./scenes/S09Encerramento";
import { CUTS, cutSeconds, FPS, HEIGHT, sec, WIDTH } from "./timeline";

const SCENE_COMPONENTS = {
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

export function Root() {
  return (
    <>
      <Composition
        id="NegocioDePe"
        component={Film}
        durationInFrames={sec(cutSeconds("full"))}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ cut: "full", showCaptions: true } satisfies FilmProps}
      />
      <Composition
        id="NegocioDePe60"
        component={Film}
        durationInFrames={sec(cutSeconds("short"))}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ cut: "short", showCaptions: true } satisfies FilmProps}
      />

      {/* Cada cena isolada, para pré-visualizar e ajustar sem tocar no resto. */}
      <Folder name="Cenas">
        {CUTS.full.map(({ id, seconds }, i) => (
          <Composition
            key={id}
            id={`Cena${String(i + 1).padStart(2, "0")}-${id}`}
            component={SCENE_COMPONENTS[id]}
            durationInFrames={sec(seconds)}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{ cut: "full" as const, seconds }}
          />
        ))}
      </Folder>
    </>
  );
}
