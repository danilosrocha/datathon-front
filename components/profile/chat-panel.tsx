"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: ChatMessage[];
  drafts: Record<string, string>;
  busy: boolean;
  onSend: (text: string) => void;
  showComposer?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function ChatPanel({ messages, drafts, busy, onSend, showComposer = true, children, className }: ChatPanelProps) {
  const [text, setText] = useState("");
  const historyRef = useRef<HTMLDivElement>(null);
  const draftEntries = Object.entries(drafts);
  // Muda a cada mensagem nova e a cada trecho do streaming.
  const scrollKey = `${messages.length}:${draftEntries.map(([, draft]) => draft.length).join(",")}:${busy}`;

  useEffect(() => {
    const history = historyRef.current;
    if (history) history.scrollTop = history.scrollHeight;
  }, [scrollKey]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!text.trim()) return;
      onSend(text);
      setText("");
    }
  }

  return (
    <section aria-label="Conversa sobre o seu negócio" className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div ref={historyRef} className="min-h-32 flex-1 overflow-y-auto bg-brand-50/30 px-4 py-4 md:px-6" aria-live="polite" aria-relevant="additions">
        <p className="mb-3 text-xs font-semibold text-ink-600">Conversa até aqui</p>
        <ol className="space-y-3">
          {messages.map((message) => (
            <Message key={message.message_id} role={message.role} text={message.text} />
          ))}
          {draftEntries.map(([id, draft]) => (
            <Message key={id} role="assistant" text={draft} streaming />
          ))}
          {busy && draftEntries.length === 0 && <Typing />}
        </ol>
      </div>

      {(children || showComposer) && (
        <div className="flex shrink-0 flex-col gap-3 bg-white p-4 md:p-6">
          {children}

          {showComposer && (
            <form onSubmit={handleSubmit} className="flex w-full shrink-0 items-end gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Responder com suas palavras
              </label>
              <Textarea
                id="chat-input"
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ou responda com suas palavras…"
                autoComplete="off"
                rows={2}
                className="min-h-12 max-h-32 flex-1 resize-y bg-white text-base leading-snug py-2.5"
              />
              <Button
                type="submit"
                size="icon-xl"
                aria-label="Enviar resposta em texto"
                disabled={!text.trim()}
                className="h-12 w-12 shrink-0 bg-brand-600 text-white hover:bg-brand-700"
              >
                <SendHorizontal />
              </Button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

function Message({ role, text, streaming }: { role: ChatMessage["role"]; text: string; streaming?: boolean }) {
  if (role === "user") {
    return (
      <li className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2 text-[15px] text-white">
          <span className="sr-only">Você: </span>
          {text}
        </p>
      </li>
    );
  }
  return (
    <li className="flex items-end gap-2">
      <p className="max-w-[88%] rounded-2xl rounded-bl-sm bg-brand-50 px-3.5 py-2.5 text-[15px] leading-relaxed text-ink-800">
        <span className="sr-only">Guia virtual: </span>
        {text}
        {streaming && <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-brand-500 motion-reduce:animate-none" />}
      </p>
    </li>
  );
}

function Typing() {
  return (
    <li className="flex items-end gap-2" role="status">
      <span className="inline-flex h-9 items-center gap-1 rounded-2xl rounded-bl-sm bg-brand-50 px-3.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            aria-hidden="true"
            style={{ animationDelay: `${delay}ms` }}
            className="size-1.5 animate-bounce rounded-full bg-brand-500 motion-reduce:animate-none"
          />
        ))}
        <span className="sr-only">O guia virtual está pensando…</span>
      </span>
    </li>
  );
}
