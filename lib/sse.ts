import { isServerEventName, type ServerEvent } from "@/lib/events";

/*
 * Assinatura do SSE do caso. Usa fetch + leitura em stream porque o
 * EventSource nativo não envia o header `X-Case-Token`. Reconecta com
 * `Last-Event-ID` e avisa `onReconnect` para o chamador refazer o snapshot.
 */

interface SubscribeOptions {
  url: string;
  token: string;
  onEvent: (event: ServerEvent) => void;
  onReconnect?: () => void;
}

const MAX_BACKOFF_MS = 10_000;

export function subscribeEvents({ url, token, onEvent, onReconnect }: SubscribeOptions) {
  const controller = new AbortController();
  let lastEventId: string | null = null;
  let attempt = 0;

  async function connect() {
    while (!controller.signal.aborted) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: "text/event-stream",
            "X-Case-Token": token,
            ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
          },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error(`SSE ${response.status}`);

        if (attempt > 0) onReconnect?.();
        attempt = 0;
        await readStream(response.body, (id, name, data) => {
          if (id) lastEventId = id;
          if (!isServerEventName(name)) return;
          try {
            onEvent({ event: name, data: JSON.parse(data) } as ServerEvent);
          } catch {
            // Evento malformado: ignora e segue o stream.
          }
        });
      } catch {
        if (controller.signal.aborted) return;
      }
      attempt += 1;
      await wait(Math.min(1000 * 2 ** (attempt - 1), MAX_BACKOFF_MS), controller.signal);
    }
  }

  void connect();
  return () => controller.abort();
}

async function readStream(body: ReadableStream<Uint8Array>, emit: (id: string | null, event: string, data: string) => void) {
  const reader = (body as unknown as ReadableStream<BufferSource>).pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += value.replace(/\r\n/g, "\n");
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      parseBlock(buffer.slice(0, boundary), emit);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
    }
  }
}

function parseBlock(block: string, emit: (id: string | null, event: string, data: string) => void) {
  let id: string | null = null;
  let event = "message";
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue; // heartbeat `: ping`
    const separator = line.indexOf(":");
    const field = separator === -1 ? line : line.slice(0, separator);
    const value = separator === -1 ? "" : line.slice(separator + 1).replace(/^ /, "");
    if (field === "id") id = value;
    else if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }
  if (data.length) emit(id, event, data.join("\n"));
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}
