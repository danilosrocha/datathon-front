// Divide cada fala em blocos curtos de legenda, com tempo proporcional ao
// número de caracteres. Compartilhado entre o SRT (scripts/narration.mjs) e a
// legenda desenhada no vídeo (src/components/Captions.tsx).

const MAX = 58;

/** Quebra um trecho longo em dois blocos equilibrados (recursivo). */
function splitBalanced(text) {
  if (text.length <= MAX) return [text];
  const words = text.split(" ");
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const score = Math.max(a.length, b.length);
    if (!best || score < best.score) best = { a, b, score };
  }
  return [...splitBalanced(best.a), ...splitBalanced(best.b)];
}

function chunk(text) {
  const sentences = text.match(/[^.?!]+[.?!]?/g).map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const sentence of sentences) {
    if (sentence.length <= MAX) {
      out.push(sentence);
      continue;
    }
    // Frase longa: junta orações separadas por vírgula/dois-pontos até o limite.
    const clauses = sentence.match(/[^,:]+[,:]?/g).map((c) => c.trim());
    let current = "";
    for (const clause of clauses) {
      const next = current ? `${current} ${clause}` : clause;
      if (next.length <= MAX) current = next;
      else {
        if (current) out.push(...splitBalanced(current));
        current = clause;
      }
    }
    if (current) out.push(...splitBalanced(current));
  }
  return out;
}

/**
 * @param {{ id: string, start: number, text: string }[]} lines
 * @param {Record<string, number>} durations
 * @returns {{ start: number, end: number, text: string }[]}
 */
export function captionBlocks(lines, durations) {
  const blocks = [];
  for (const line of lines) {
    const pieces = chunk(line.text);
    const total = pieces.reduce((sum, p) => sum + p.length, 0);
    let t = line.start;
    for (const piece of pieces) {
      const d = (piece.length / total) * durations[line.id];
      blocks.push({ start: +t.toFixed(3), end: +(t + d).toFixed(3), text: piece });
      t += d;
    }
  }
  return blocks;
}
