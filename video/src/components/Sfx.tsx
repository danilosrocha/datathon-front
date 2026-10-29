import { Audio, Sequence, staticFile } from "remotion";
import { sec } from "../timeline";

export type SfxName = "pop" | "confirm" | "whoosh" | "tick" | "swell";

/** Efeito sonoro discreto em `at` segundos da cena. */
export function Sfx({ name, at, volume = 1 }: { name: SfxName; at: number; volume?: number }) {
  if (at < 0) return null;
  return (
    <Sequence from={sec(at)} durationInFrames={sec(2.4)} layout="none">
      <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
}
