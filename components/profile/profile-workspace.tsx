"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

import { AvatarStage } from "@/components/profile/avatar-stage";
import { ChatPanel } from "@/components/profile/chat-panel";
import { ProfilePanel, visibleCards } from "@/components/profile/profile-panel";
import { QuestionBar } from "@/components/profile/question-bar";
import { RecommendationExperience } from "@/components/profile/recommendation-experience";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useCaseSession } from "@/lib/case/use-case-session";
import { ROUTES } from "@/lib/site";

/**
 * Traçado de perfil. Desktop: pergunta + conversa à esquerda, assistente +
 * perfil à direita. Mobile: pergunta no topo, conversa no meio e o perfil
 * numa gaveta inferior.
 */
export function ProfileWorkspace({ caseId }: { caseId: string }) {
  const [reviewing, setReviewing] = useState(false);
  const [resultSeen, setResultSeen] = useState(false);
  const { state, answerQuestion, sendMessage, editFact, confirmFact, removeFact } = useCaseSession(caseId);
  const toConfirm = visibleCards(state).filter((card) => card.status === "estimado").length;
  const inputType = state.question?.input.type;
  const showComposer = inputType !== "text" && inputType !== "cnpj" && inputType !== "cep" && inputType !== "number";

  // Identifica eventos de descoberta relevante (ex.: necessidade de proteção de alta importância identificada)
  const lastActivity = state.activity[0];
  const discoveredNeed = lastActivity?.kind === "atencao" ? lastActivity.id : undefined;

  const genieSignal = {
    scene: "conversation" as const,
    questionId: state.question?.question_id,
    processing: Boolean(state.submittedQuestionId || state.busy),
    discoveredNeed,
  };

  if (state.phase === "loading") return <WorkspaceSkeleton />;
  if (state.phase === "error") {
    return (
      <div className="container-page flex flex-1 items-center justify-center py-16">
        <div className="max-w-md rounded-xl border bg-white p-8 text-center">
          <h1 className="font-heading text-xl font-semibold text-brand-900">Não conseguimos abrir esta conversa</h1>
          <p className="mt-2 text-[15px] text-ink-600">{state.error}</p>
          <Button asChild size="xl" className="mt-6">
            <Link href={ROUTES.profile}>
              <RotateCcw data-icon="inline-start" />
              Começar uma nova conversa
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (state.finished && state.eligibility?.status !== "inelegivel" && !reviewing) {
    return <RecommendationExperience state={state} alreadySeen={resultSeen} onComplete={() => setResultSeen(true)} onReview={() => setReviewing(true)} />;
  }

  const panelProps = { state, onEdit: editFact, onConfirm: confirmFact, onRemove: removeFact };

  return (
    <div className="container-page grid min-h-0 flex-1 gap-4 py-3 md:py-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-5">
      <div className="flex min-h-0 flex-col gap-3">
        {reviewing && state.recommendation && (
          <Button variant="outline" size="md" onClick={() => setReviewing(false)} className="self-start rounded-full border-brand-300 text-brand-900">
            Ver recomendação
            <ArrowRight data-icon="inline-end" />
          </Button>
        )}
        {/* Mobile: assistente compacto + acesso ao perfil */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <AvatarStage signal={genieSignal} variant="compact" />
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="md" className="shrink-0 border-brand-300 text-brand-900" aria-label={`Para confirmar: ${toConfirm} informações. Abrir perfil`}>
                Para confirmar · {toConfirm}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85dvh]">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Perfil do seu negócio</DrawerTitle>
                <DrawerDescription>Informações identificadas na conversa</DrawerDescription>
              </DrawerHeader>
              <ProfilePanel {...panelProps} className="min-h-0 flex-1 px-4 pt-2" />
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white">
          <QuestionBar
            question={state.question}
            busy={state.busy}
            finished={state.finished}
            eligibility={state.eligibility}
            variant="header"
          />
          <ChatPanel
            messages={state.messages}
            drafts={state.drafts}
            busy={state.busy}
            onSend={sendMessage}
            showComposer={showComposer}
            className="min-h-40 flex-1"
          >
            <QuestionBar
              question={state.question}
              busy={state.busy}
              finished={state.finished}
              eligibility={state.eligibility}
              onAnswer={answerQuestion}
              variant="input"
            />
          </ChatPanel>
        </div>
      </div>

      <aside className="hidden min-h-0 flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-4 lg:flex">
        <AvatarStage signal={genieSignal} variant="sidebar" className="border-b border-brand-100 pb-3" />
        <ProfilePanel {...panelProps} className="flex-1" />
      </aside>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div aria-busy="true" className="container-page grid flex-1 gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_23rem]">
      <span className="sr-only">Carregando a conversa…</span>
      <div className="space-y-4">
        <div className="h-44 animate-pulse rounded-xl bg-white" />
        <div className="h-64 animate-pulse rounded-xl bg-white/70" />
      </div>
      <div className="hidden h-[32rem] animate-pulse rounded-xl bg-white lg:block" />
    </div>
  );
}
