"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Loader2, MessagesSquare, PencilLine, UserRoundCheck } from "lucide-react";

import { GenioBB } from "@/components/profile/genio-bb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveCaseToken } from "@/lib/case/token-storage";
import { USE_MOCKS, caseTransport } from "@/lib/case/transport";
import { caseHref } from "@/lib/site";

const EXPECTATIONS = [
  { icon: MessagesSquare, text: "Uma conversa curta: eu pergunto só o que ainda não sei." },
  { icon: PencilLine, text: "Tudo o que eu entender aparece no seu perfil, e você pode corrigir." },
  { icon: UserRoundCheck, text: "Se preferir, você pode pedir revisão humana da recomendação." },
];

/** Consentimento antes de criar o caso (`POST /cases` com `consent: true`). */
export function ConsentStart() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    // Garante que o estado de starting e de consentimento sempre estejam limpos ao entrar/montar
    // e também quando o navegador restaura a página de cache/histórico (bfcache).
    setStarting(false);
    setConsent(false);
    setError(null);
    const reset = () => {
      setStarting(false);
      setConsent(false);
      setError(null);
    };
    window.addEventListener("pageshow", reset);
    return () => {
      setStarting(false);
      setConsent(false);
      window.removeEventListener("pageshow", reset);
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!consent) {
      setError("Para começar, precisamos do seu consentimento.");
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const { case_id, case_token } = await caseTransport.createCase();
      saveCaseToken(case_id, case_token);
      router.push(caseHref(case_id));
    } catch {
      setStarting(false);
      setError("Não foi possível iniciar a conversa agora. Tente novamente em instantes.");
    }
  }

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-brand-100 bg-white lg:grid-cols-2">
      <div className="flex min-h-80 flex-col overflow-hidden bg-[#FDEE4F] px-6 pt-8 sm:px-9 lg:min-h-[610px] lg:px-11 lg:pt-11">
        <p className="text-sm font-medium text-brand-900">Descoberta inteligente</p>
        <h1 className="mt-5 max-w-md text-3xl leading-[1.13] font-semibold tracking-[-0.045em] text-brand-950 sm:text-4xl lg:text-[2.75rem]">
          Vamos conhecer o seu negócio.
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-brand-950">
          Eu ajudo você a encontrar as proteções que fazem sentido para o que construiu.
        </p>
        <GenioBB signal={{ scene: "welcome" }} className="mx-auto mt-auto max-w-[440px]" />
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col justify-center p-6 sm:p-9 lg:p-11"
      >
        <h2 className="text-xl font-semibold text-brand-950 sm:text-2xl">Antes de começar</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">Você conversa no seu ritmo e pode revisar cada informação.</p>
        <ul className="mt-7 space-y-5">
          {EXPECTATIONS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-800">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-900">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border bg-brand-50/60 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => {
                setConsent(checked === true);
                if (checked) setError(null);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "consent-error" : undefined}
              className="mt-0.5 size-5 border-brand-300 bg-white data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600"
            />
            <Label htmlFor="consent" className="block text-sm leading-relaxed font-normal text-ink-800">
              Concordo que as informações que eu compartilhar sejam usadas para montar uma recomendação de proteção para
              o meu negócio.
            </Label>
          </div>
          {error && <p id="consent-error" role="alert" className="mt-2 pl-8 text-sm font-medium text-destructive">{error}</p>}
        </div>

        <Button type="submit" variant="highlight" size="xl" disabled={starting} className="mt-7 h-12 w-full rounded-full">
          {starting ? <Loader2 className="animate-spin motion-reduce:animate-none" data-icon="inline-start" /> : null}
          Começar conversa
          {!starting && <ArrowRight data-icon="inline-end" />}
        </Button>
        <p className="mt-4 text-center text-xs text-ink-600">
          {USE_MOCKS ? "Modo demonstração: as respostas não saem do seu navegador." : "Isto não é uma cotação nem uma contratação."}
        </p>
      </form>
    </div>
  );
}
