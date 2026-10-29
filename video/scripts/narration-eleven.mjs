// Gera a locução com a voz clonada no ElevenLabs.
//
// Lê a chave de video/.env (ELEVENLABS_API_KEY, fora do git) e o Voice ID de
// narration/script.json (`elevenlabs.voiceId`). Cada fala vira
// public/audio/narration/<id>.wav; a voz anterior fica guardada em
// public/audio/narration-say/. Depois, rode `pnpm narration -- --measure-only`
// para atualizar durações e legendas.
//
// Uso: pnpm narration:eleven            (todas as falas)
//      pnpm narration:eleven -- n05 s05 (só algumas)

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO = join(ROOT, "public", "audio", "narration");
const BACKUP = join(ROOT, "public", "audio", "narration-say");
const TMP = join(ROOT, ".tts");

function readEnv() {
  const file = join(ROOT, ".env");
  if (!existsSync(file)) throw new Error("Crie video/.env com ELEVENLABS_API_KEY=...");
  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).trim()]),
  );
}

const env = readEnv();
const apiKey = env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error("ELEVENLABS_API_KEY ausente em video/.env");

const script = JSON.parse(readFileSync(join(ROOT, "narration", "script.json"), "utf8"));
const cfg = script.elevenlabs;
if (!cfg?.voiceId) throw new Error("Defina elevenlabs.voiceId em narration/script.json");

/** Normaliza o volume da fala (RMS alvo, sem passar de -1 dBFS de pico). */
function normalize(file, targetDb = -18) {
  const buf = readFileSync(file);
  const data = buf.indexOf("data") + 8;
  let sum = 0;
  let peak = 0;
  const n = (buf.length - data) / 2;
  for (let i = data; i + 1 < buf.length; i += 2) {
    const v = buf.readInt16LE(i) / 32768;
    sum += v * v;
    peak = Math.max(peak, Math.abs(v));
  }
  const rmsDb = 10 * Math.log10(sum / n);
  const gain = Math.min(10 ** ((targetDb - rmsDb) / 20), 0.89 / peak);
  for (let i = data; i + 1 < buf.length; i += 2) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(buf.readInt16LE(i) * gain))), i);
  }
  writeFileSync(file, buf);
}

const only = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
if (process.argv.includes("--normalize-only")) {
  for (const line of script.lines.filter((l) => !only.length || only.includes(l.id))) normalize(join(AUDIO, `${line.id}.wav`));
  console.log("✔ volumes normalizados");
  process.exit(0);
}
const lines = script.lines.filter((line) => !only.length || only.includes(line.id));
mkdirSync(AUDIO, { recursive: true });
mkdirSync(BACKUP, { recursive: true });
mkdirSync(TMP, { recursive: true });

for (const [i, line] of lines.entries()) {
  const target = join(AUDIO, `${line.id}.wav`);
  const backup = join(BACKUP, `${line.id}.wav`);
  if (existsSync(target) && !existsSync(backup)) copyFileSync(target, backup);

  // Falas vizinhas da mesma versão dão contexto de entonação.
  const sameCut = script.lines.filter((l) => l.cut === line.cut);
  const k = sameCut.findIndex((l) => l.id === line.id);
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${cfg.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: line.text,
        model_id: cfg.model ?? "eleven_multilingual_v2",
        previous_text: sameCut[k - 1]?.text,
        next_text: sameCut[k + 1]?.text,
        voice_settings: cfg.voiceSettings,
      }),
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ElevenLabs ${response.status} em ${line.id}: ${detail.slice(0, 400)}`);
  }
  const mp3 = join(TMP, `${line.id}.mp3`);
  writeFileSync(mp3, Buffer.from(await response.arrayBuffer()));
  execFileSync(join(ROOT, "node_modules", ".bin", "remotion"), [
    "ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", target,
  ]);
  normalize(target);
  console.log(`✔ ${line.id} (${i + 1}/${lines.length})`);
}

rmSync(TMP, { recursive: true, force: true });
console.log("\nAgora: pnpm narration -- --measure-only");
