// Gera a locução de referência com a voz pt-BR do macOS (`say`), mede cada
// trecho e exporta as legendas (SRT) das duas versões.
//
// A locução é provisória: para trocar por uma gravação humana, substitua os
// arquivos em public/audio/narration/<id>.wav (mesmo nome) e rode
// `pnpm narration -- --measure-only` para atualizar as durações e as legendas.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = JSON.parse(readFileSync(join(ROOT, "narration", "script.json"), "utf8"));
const AUDIO = join(ROOT, "public", "audio", "narration");
const measureOnly = process.argv.includes("--measure-only");
mkdirSync(AUDIO, { recursive: true });
mkdirSync(join(ROOT, "src", "generated"), { recursive: true });

/** Duração de um WAV PCM lendo os chunks `fmt ` e `data`. */
function wavDuration(file) {
  const buf = readFileSync(file);
  let offset = 12;
  let byteRate = 0;
  while (offset < buf.length) {
    const id = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === "fmt ") byteRate = buf.readUInt32LE(offset + 16);
    if (id === "data") return size / byteRate;
    offset += 8 + size + (size % 2);
  }
  throw new Error(`WAV inválido: ${file}`);
}

const durations = {};
for (const line of script.lines) {
  const file = join(AUDIO, `${line.id}.wav`);
  if (!measureOnly) {
    execFileSync("say", ["-v", script.voice, "-r", String(script.rate), "-o", file, "--data-format=LEI16@44100", line.text]);
  }
  durations[line.id] = +wavDuration(file).toFixed(3);
  console.log(`${line.id}  ${line.start.toFixed(1)}→${(line.start + durations[line.id]).toFixed(1)}s  ${line.text}`);
}
writeFileSync(join(ROOT, "src", "generated", "narration-durations.json"), JSON.stringify(durations, null, 2));

/* ------------------------------ legendas SRT ------------------------------ */

const stamp = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

// Mesma regra de blocos usada na tela (src/captions.ts).
const { captionBlocks } = await import("../src/captions-core.mjs");

for (const cut of ["full", "short"]) {
  const blocks = captionBlocks(script.lines.filter((l) => l.cut === cut), durations).map(
    (b, i) => `${i + 1}\n${stamp(b.start)} --> ${stamp(b.end)}\n${b.text}\n`,
  );
  const name = cut === "full" ? "negocio-de-pe-120s.srt" : "negocio-de-pe-60s.srt";
  mkdirSync(join(ROOT, "out"), { recursive: true });
  writeFileSync(join(ROOT, "out", name), blocks.join("\n"));
  console.log(`✔ out/${name} (${blocks.length} blocos)`);
}
