// Grava o fluxo real da aplicação (modo demonstração) em clipes curtos.
//
// Cada clipe é capturado por screencast (CDP) em 2× de densidade, para que as
// aproximações de câmera no Remotion continuem nítidas, e depois codificado em
// MP4 a 30 fps com o FFmpeg embutido no Remotion. As marcas de tempo de cada
// ação vão para public/capture/markers.json e alimentam a montagem.
//
// Nada na aplicação é alterado: injetamos só um cursor-guia e um CSS que
// esconde o indicador de desenvolvimento do Next.js, durante a gravação.
//
// Uso: APP_URL=http://localhost:3000 node capture/capture.mjs

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const OUT = join(ROOT, "public", "capture");
const TMP = join(ROOT, ".capture-frames");
const VIEWPORT = { width: 1440, height: 810 };
const SCALE = 2;
const FPS = 30;

const CAPTURE_CSS = `
  nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }
  #ndp-cursor {
    position: fixed; left: 0; top: 0; z-index: 2147483647; pointer-events: none;
    width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 999px;
    background: rgba(0, 48, 135, 0.18); border: 2px solid rgba(0, 48, 135, 0.85);
    box-shadow: 0 2px 10px rgba(0, 31, 92, 0.25);
    transition: transform 140ms ease-out, opacity 300ms ease;
  }
  #ndp-cursor.down { transform: scale(0.72); background: rgba(252, 238, 79, 0.9); }
`;

function installCursor() {
  if (document.getElementById("ndp-cursor")) return;
  const dot = document.createElement("div");
  dot.id = "ndp-cursor";
  dot.style.opacity = "0";
  document.documentElement.appendChild(dot);
  window.__ndpCursor ??= { x: innerWidth * 0.62, y: innerHeight * 0.7 };
  dot.style.translate = `${window.__ndpCursor.x}px ${window.__ndpCursor.y}px`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* --------------------------------- clipes --------------------------------- */

const markers = {};
let current = null;

async function startClip(cdp, name) {
  const dir = join(TMP, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  current = { name, dir, frames: [], t0: Date.now() / 1000, marks: {} };
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 88,
    maxWidth: VIEWPORT.width * SCALE,
    maxHeight: VIEWPORT.height * SCALE,
    everyNthFrame: 1,
  });
  await sleep(150);
}

function mark(label) {
  current.marks[label] = +(Date.now() / 1000 - current.t0).toFixed(3);
  console.log(`  · ${current.name} ${label} @ ${current.marks[label]}s`);
}

async function stopClip(cdp) {
  await sleep(150);
  await cdp.send("Page.stopScreencast");
  const clip = current;
  current = null;
  const end = Date.now() / 1000;
  if (!clip.frames.length) throw new Error(`Clipe ${clip.name} sem quadros`);
  // Concat demuxer: cada quadro dura até o próximo; o primeiro cobre desde t0.
  const lines = [];
  clip.frames.forEach((frame, i) => {
    const from = i === 0 ? clip.t0 : frame.t;
    const next = clip.frames[i + 1]?.t ?? end;
    lines.push(`file '${frame.file}'`, `duration ${Math.max(0.001, next - from).toFixed(4)}`);
  });
  lines.push(`file '${clip.frames.at(-1).file}'`);
  const list = join(clip.dir, "list.txt");
  writeFileSync(list, lines.join("\n"));
  execFileSync(
    join(ROOT, "node_modules", ".bin", "remotion"),
    [
      "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list,
      "-r", String(FPS), "-fps_mode", "cfr", "-vf", `scale=${VIEWPORT.width * SCALE}:${VIEWPORT.height * SCALE}:flags=lanczos,format=yuv420p`,
      "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-aspect", "16:9", "-movflags", "+faststart",
      join(OUT, `${clip.name}.mp4`),
    ],
    { stdio: "inherit" },
  );
  markers[clip.name] = { duration: +(end - clip.t0).toFixed(3), ...clip.marks };
  console.log(`✔ ${clip.name}.mp4 (${clip.frames.length} quadros, ${markers[clip.name].duration}s)`);
}

/* ---------------------------- cursor e cliques ---------------------------- */

async function moveTo(page, locator, { duration = 650 } = {}) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("Elemento sem posição na tela");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate(installCursor);
  await page.evaluate(
    ({ x, y, duration }) =>
      new Promise((resolve) => {
        const dot = document.getElementById("ndp-cursor");
        const from = window.__ndpCursor;
        dot.style.opacity = "1";
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          dot.style.translate = `${from.x + (x - from.x) * e}px ${from.y + (y - from.y) * e}px`;
          if (p < 1) return requestAnimationFrame(step);
          window.__ndpCursor = { x, y };
          resolve();
        };
        requestAnimationFrame(step);
      }),
    { x, y, duration },
  );
  await page.mouse.move(x, y);
}

async function click(page, locator, opts) {
  await moveTo(page, locator, opts);
  await sleep(140);
  await page.evaluate(() => document.getElementById("ndp-cursor")?.classList.add("down"));
  await locator.click();
  await sleep(120);
  await page.evaluate(() => document.getElementById("ndp-cursor")?.classList.remove("down"));
}

async function hideCursor(page) {
  await page.evaluate(() => {
    const dot = document.getElementById("ndp-cursor");
    if (dot) dot.style.opacity = "0";
  });
}

async function typeInto(page, locator, text, delay = 95) {
  await click(page, locator);
  await page.keyboard.type(text, { delay });
}

/** Rola suavemente o painel de perfil até o card (só a rolagem, sem clique). */
async function revealCard(page, name) {
  await page.getByRole("button", { name }).evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
  await sleep(900);
}

/** Opções de `select` são itens de ToggleGroup (role radio). */
const option = (scope, name) => scope.getByRole("radio", { name, exact: true });

/** Espera o turno do assistente terminar. */
async function settle(page, extra = 400) {
  await page.waitForFunction(() => !document.body.innerText.includes("Atualizando o seu perfil"), null, { timeout: 20000 });
  await sleep(extra);
}

async function question(page, text) {
  await page.getByRole("heading", { name: text }).waitFor({ timeout: 20000 });
  await settle(page);
}

/* --------------------------------- roteiro -------------------------------- */

async function run() {
  mkdirSync(OUT, { recursive: true });
  // Usa o Chrome instalado (CAPTURE_CHANNEL=chromium para o navegador do Playwright).
  const browser = await chromium.launch({ channel: process.env.CAPTURE_CHANNEL ?? "chrome" });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE, locale: "pt-BR" });
  await context.addInitScript({
    content: `addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(CAPTURE_CSS)}; document.head.appendChild(s); });`,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  cdp.on("Page.screencastFrame", ({ data, sessionId, metadata }) => {
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => undefined);
    if (!current) return;
    const file = join(current.dir, `f${String(current.frames.length).padStart(5, "0")}.jpg`);
    writeFileSync(file, Buffer.from(data, "base64"));
    current.frames.push({ t: metadata.timestamp ?? Date.now() / 1000, file });
  });

  // Aquece as rotas (compilação do Next em modo dev) antes de gravar.
  console.log("Aquecendo rotas…");
  await page.goto(`${APP_URL}/perfil`, { waitUntil: "networkidle" });
  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.evaluate(installCursor);
  await sleep(2500);

  /* 01 · Home → consentimento → primeira pergunta */
  await startClip(cdp, "01-home");
  await sleep(2200);
  mark("cursor");
  await click(page, page.getByRole("link", { name: /Descobrir minha prote/ }).first(), { duration: 900 });
  mark("click");
  await page.getByRole("heading", { name: "Vamos conhecer o seu negócio." }).waitFor();
  mark("consent");
  await sleep(1800);
  await click(page, page.getByRole("checkbox"));
  mark("checked");
  await sleep(500);
  await click(page, page.getByRole("button", { name: "Começar conversa" }));
  mark("start-chat");
  await page.waitForURL(/\/perfil\/[0-9a-f-]{36}/);
  await question(page, /atividade principal/);
  mark("first-question");
  await sleep(1400);
  await stopClip(cdp);

  /* 02 · Restaurante e "Por que pergunto isso?" */
  await startClip(cdp, "02-atividade");
  await sleep(400);
  await click(page, option(page, "Restaurante, padaria ou lanchonete"));
  mark("answer");
  await question(page, /Como se chama a empresa/);
  mark("next-question");
  await sleep(700);
  await typeInto(page, page.getByRole("textbox").first(), "Cantina da Vila", 70);
  await sleep(250);
  await click(page, page.getByRole("button", { name: "Responder" }));
  mark("name-sent");
  await question(page, /CEP do estabelecimento/);
  mark("cep-question");
  await sleep(700);
  await click(page, page.getByRole("button", { name: "Por que pergunto isso?" }));
  mark("why-open");
  await sleep(3200);
  await page.keyboard.press("Escape");
  mark("why-close");
  await sleep(500);
  await stopClip(cdp);

  /* 03 · CEP → município → clima → cards estimados (momento WOW) */
  await startClip(cdp, "03-cep");
  await sleep(500);
  await typeInto(page, page.getByRole("textbox").first(), "01310100", 120);
  mark("typed");
  await sleep(350);
  await click(page, page.getByRole("button", { name: "Responder" }));
  mark("submit");
  await hideCursor(page);
  await page.getByRole("button", { name: /^Município:/ }).waitFor({ timeout: 20000 });
  mark("municipio");
  await page.getByRole("button", { name: /^Vendaval na região:/ }).waitFor({ timeout: 20000 });
  mark("riscos");
  await question(page, /próprio ou alugado/);
  mark("next-question");
  await sleep(500);
  await revealCard(page, /^Alagamento na região:/);
  mark("cards-visible");
  await sleep(2600);
  await stopClip(cdp);

  /* 04 · Imóvel, obra e estoque estimado → corrigir → confirmado */
  await startClip(cdp, "04-estoque");
  await sleep(300);
  await click(page, option(page, "Alugado"));
  await question(page, /obra, reforma/);
  mark("obra");
  await click(page, page.getByRole("button", { name: "Não", exact: true }));
  await question(page, /estoque de mercadorias/);
  mark("estoque-question");
  await sleep(400);
  await click(page, page.getByRole("button", { name: "Sim", exact: true }));
  mark("estoque-sim");
  await hideCursor(page);
  const stockCard = page.getByRole("button", { name: /^Valor do estoque:/ });
  await stockCard.waitFor({ timeout: 20000 });
  mark("estimado");
  await question(page, /geladeiras, freezers/);
  await sleep(1400);
  await click(page, stockCard, { duration: 900 });
  mark("card-open");
  await sleep(3000);
  await click(page, page.getByRole("dialog").getByRole("button", { name: "Corrigir" }));
  mark("corrigir");
  await sleep(1000);
  await click(page, option(page.getByRole("dialog"), "R$ 10 a 50 mil"));
  mark("confirmado");
  await hideCursor(page);
  await sleep(700);
  await revealCard(page, /^Valor do estoque:/);
  mark("confirmado-visible");
  await sleep(2600);
  await stopClip(cdp);

  /* Respostas restantes, sem gravar */
  await click(page, page.getByRole("button", { name: "Sim", exact: true }));
  await question(page, /itens de segurança/);
  await click(page, page.getByRole("radio", { name: "Alarme" }).or(page.getByRole("button", { name: "Alarme" })).first());
  await click(page, page.getByRole("radio", { name: "Câmeras" }).or(page.getByRole("button", { name: "Câmeras" })).first());
  await click(page, page.getByRole("button", { name: /^Confirmar/ }));
  await question(page, /gasta por mês/);
  await click(page, option(page, "R$ 10 a 50 mil"));
  await question(page, /quantos dias/);
  await typeInto(page, page.getByRole("spinbutton").first(), "15", 90);
  await click(page, page.getByRole("button", { name: "Responder" }));
  await question(page, /dados de clientes/);
  await sleep(600);

  /* 05 · Última resposta → análise → três caminhos */
  await startClip(cdp, "05-recomendacao");
  await sleep(300);
  await click(page, page.getByRole("button", { name: "Sim", exact: true }));
  mark("last-answer");
  await hideCursor(page);
  await page.getByText("Seu perfil está completo").waitFor({ timeout: 30000 });
  mark("analysis");
  await page.getByRole("heading", { name: /mais de um caminho/ }).waitFor({ timeout: 30000 });
  mark("offers");
  await sleep(2600);
  await page.mouse.wheel(0, 420);
  mark("scroll");
  await sleep(3400);
  await stopClip(cdp);

  writeFileSync(join(OUT, "markers.json"), JSON.stringify(markers, null, 2));
  await browser.close();
  rmSync(TMP, { recursive: true, force: true });
  console.log("\nMarcas salvas em public/capture/markers.json");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
