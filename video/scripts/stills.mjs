// Renderiza quadros de prévia para revisão rápida (sem gerar o vídeo).
// Uso: node scripts/stills.mjs <composição> <segundo> [<segundo> …] [--out pasta] [--scale 0.5]

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const [value] = args.splice(i, 2).slice(1);
  return value;
};
const out = flag("--out", join(ROOT, "out", "stills"));
const scale = Number(flag("--scale", "0.5"));
const [id, ...seconds] = args;
mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: join(ROOT, "src", "index.ts") });
const composition = await selectComposition({ serveUrl, id });
for (const s of seconds) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  const output = join(out, `${id}-${String(s).padStart(6, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output, scale });
  console.log(output);
}
