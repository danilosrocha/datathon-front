// Sintetiza a trilha e os efeitos sonoros do vídeo, sem amostras externas:
// tudo é gerado aqui por osciladores, portanto livre de direitos autorais.
//
// A trilha acompanha o arco do roteiro: reflexão → descoberta → momento WOW →
// confiança. As seções de cada versão (120 s e 60 s) estão em SECTIONS.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "audio");
const RATE = 44100;
mkdirSync(join(OUT, "sfx"), { recursive: true });

/* --------------------------------- util --------------------------------- */

function writeWav(file, left, right = left) {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  writeFileSync(file, buf);
}

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const smooth = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/** Ruído determinístico (mesma trilha a cada execução). */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296 * 2 - 1;
  };
}

/* --------------------------------- trilha -------------------------------- */

// Am(add9) → Fmaj7 → C(add9) → G6: aberto, calmo, sem resolver cedo demais.
const CHORDS = [
  [57, 64, 67, 71, 72],
  [53, 60, 64, 67, 69],
  [48, 55, 62, 64, 67],
  [55, 59, 62, 64, 67],
];
const FINAL = [48, 55, 60, 64, 67, 72];

// Intensidades por seção: pad, arpejo, pulso, brilho.
const MOODS = {
  reflexao: { pad: 0.9, arp: 0.0, pulse: 0.0, air: 0.15 },
  problema: { pad: 0.75, arp: 0.0, pulse: 0.0, air: 0.05 },
  descoberta: { pad: 0.8, arp: 0.55, pulse: 0.0, air: 0.35 },
  wow: { pad: 0.85, arp: 0.8, pulse: 0.55, air: 0.5 },
  confianca: { pad: 0.85, arp: 0.45, pulse: 0.25, air: 0.4 },
  final: { pad: 1.0, arp: 0.25, pulse: 0.0, air: 0.5 },
};

const SECTIONS = {
  full: {
    length: 120,
    marks: [
      [0, "reflexao"], [10, "problema"], [22, "descoberta"], [48, "wow"],
      [67, "confianca"], [82, "confianca"], [94, "descoberta"], [108, "final"],
    ],
  },
  short: {
    length: 60,
    marks: [[0, "reflexao"], [7, "descoberta"], [13, "wow"], [28, "confianca"], [47, "descoberta"], [53, "final"]],
  },
};

function moodAt(marks, t) {
  // Interpola as intensidades com 2,5 s de transição entre seções.
  let current = MOODS[marks[0][1]];
  for (let i = 1; i < marks.length; i++) {
    const [start, name] = marks[i];
    const k = smooth(clamp01((t - start + 1.25) / 2.5));
    if (k <= 0) break;
    const next = MOODS[name];
    current = Object.fromEntries(Object.keys(current).map((key) => [key, current[key] + (next[key] - current[key]) * k]));
  }
  return current;
}

function renderMusic({ length, marks }) {
  const n = Math.round(length * RATE);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const noise = rng(7);
  const CHORD_S = 4.8;
  const finalAt = marks.at(-1)[0];
  let lpL = 0;
  let lpR = 0;
  let airLp = 0;

  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const m = moodAt(marks, t);
    const isFinal = t >= finalAt;
    const chordIndex = Math.floor(t / CHORD_S) % CHORDS.length;
    const chord = isFinal ? FINAL : CHORDS[chordIndex];
    const inChord = (t % CHORD_S) / CHORD_S;
    // Crossfade suave na troca de acorde.
    const prev = isFinal ? FINAL : CHORDS[(chordIndex + CHORDS.length - 1) % CHORDS.length];
    const xf = smooth(clamp01(inChord / 0.18));

    // Pad: senos levemente desafinados por voz, panorama aberto.
    let padL = 0;
    let padR = 0;
    const voices = (notes, gain) => {
      notes.forEach((note, v) => {
        const f = midi(note + 12 * (v > 2 ? 0 : 0));
        const a = Math.sin(2 * Math.PI * f * 1.0015 * t + v);
        const b = Math.sin(2 * Math.PI * f * 0.9985 * t + v * 2.1);
        const h = 0.18 * Math.sin(2 * Math.PI * f * 2 * t + v);
        const pan = (v / (notes.length - 1)) * 0.8 - 0.4;
        const s = (a + b + h) * gain;
        padL += s * (0.5 - pan * 0.5);
        padR += s * (0.5 + pan * 0.5);
      });
    };
    voices(chord, xf * 0.035);
    if (xf < 1) voices(prev, (1 - xf) * 0.035);
    // Respiração lenta do pad.
    const breathe = 0.85 + 0.15 * Math.sin(2 * Math.PI * t / 9.6);
    padL *= m.pad * breathe;
    padR *= m.pad * breathe;
    lpL += (padL - lpL) * 0.12;
    lpR += (padR - lpR) * 0.12;

    // Baixo: fundamental do acorde, uma oitava abaixo.
    const root = midi(chord[0] - 12);
    const bass = Math.sin(2 * Math.PI * root * t) * 0.05 * m.pad * (0.7 + 0.3 * xf);

    // Arpejo em colcheias a 100 BPM, notas do acorde subindo uma oitava.
    let arp = 0;
    if (m.arp > 0.01) {
      const step = 60 / 100 / 2;
      const k = Math.floor(t / step);
      const local = t - k * step;
      const note = chord[(k * 2) % chord.length] + 12;
      const env = Math.exp(-local * 7) * clamp01(local / 0.004);
      arp = Math.sin(2 * Math.PI * midi(note) * t) * env * 0.05 * m.arp;
      arp += Math.sin(2 * Math.PI * midi(note) * 2 * t) * env * 0.012 * m.arp;
    }

    // Pulso grave discreto (semínimas a 100 BPM) só no momento WOW.
    let pulse = 0;
    if (m.pulse > 0.01) {
      const beat = 60 / 100;
      const local = t % beat;
      const f = 55 + 40 * Math.exp(-local * 30);
      pulse = Math.sin(2 * Math.PI * f * local) * Math.exp(-local * 9) * 0.11 * m.pulse;
    }

    // "Ar": ruído filtrado muito baixo, dá espaço e brilho.
    airLp += (noise() - airLp) * 0.02;
    const air = airLp * 0.05 * m.air;

    const fadeIn = smooth(clamp01(t / 3));
    const fadeOut = smooth(clamp01((length - t) / 4));
    const master = fadeIn * fadeOut;
    const arpPan = Math.sin(t * 0.7) * 0.3;
    L[i] = (lpL + bass + arp * (0.5 - arpPan) + pulse + air) * master;
    R[i] = (lpR + bass + arp * (0.5 + arpPan) + pulse - air) * master;
  }
  return [L, R];
}

/* --------------------------------- efeitos -------------------------------- */

function render(seconds, fn) {
  const n = Math.round(seconds * RATE);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const [l, r = l] = [].concat(fn(i / RATE, i));
    L[i] = l;
    R[i] = r;
  }
  return [L, R];
}

const SFX = {
  // Card surgindo: bolha curta e macia.
  pop: () => {
    const nz = rng(3);
    return render(0.22, (t) => {
      const f = 520 + 380 * Math.exp(-t * 40);
      return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 26) * 0.32 + nz() * Math.exp(-t * 300) * 0.03;
    });
  },
  // Confirmação: duas notas de sino (Mi → Si).
  confirm: () =>
    render(0.9, (t) => {
      const bell = (f, at) => {
        const lt = t - at;
        if (lt < 0) return 0;
        return (Math.sin(2 * Math.PI * f * lt) + 0.35 * Math.sin(2 * Math.PI * f * 2.76 * lt) * Math.exp(-lt * 6)) * Math.exp(-lt * 5.5);
      };
      return (bell(midi(76), 0) + bell(midi(83), 0.11)) * 0.13;
    }),
  // Entrada de elementos: sopro de ar filtrado.
  whoosh: () => {
    const nz = rng(11);
    let lp = 0;
    return render(1.0, (t) => {
      const env = Math.sin(Math.PI * clamp01(t / 1.0)) ** 2;
      const cut = 0.01 + 0.12 * env;
      lp += (nz() - lp) * cut;
      return [lp * env * 0.55, lp * env * 0.45];
    });
  },
  // Clique de interface.
  tick: () => {
    const nz = rng(5);
    return render(0.06, (t) => (Math.sin(2 * Math.PI * 1800 * t) * 0.12 + nz() * 0.05) * Math.exp(-t * 90));
  },
  // Transição para as recomendações: acorde que cresce e se abre.
  swell: () =>
    render(2.2, (t) => {
      const env = smooth(clamp01(t / 1.4)) * smooth(clamp01((2.2 - t) / 0.8));
      const notes = [60, 64, 67, 71, 74];
      const s = notes.reduce((sum, n, v) => sum + Math.sin(2 * Math.PI * midi(n) * t + v), 0);
      return s * env * 0.035;
    }),
};

/* --------------------------------- saída --------------------------------- */

for (const [cut, spec] of Object.entries(SECTIONS)) {
  const [L, R] = renderMusic(spec);
  writeWav(join(OUT, `music-${cut}.wav`), L, R);
  console.log(`✔ music-${cut}.wav (${spec.length}s)`);
}
for (const [name, make] of Object.entries(SFX)) {
  const [L, R] = make();
  writeWav(join(OUT, "sfx", `${name}.wav`), L, R);
  console.log(`✔ sfx/${name}.wav`);
}
