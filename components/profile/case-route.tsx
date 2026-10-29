"use client";

import { useParams } from "next/navigation";

import { ProfileWorkspace } from "@/components/profile/profile-workspace";

/** Lê o `caseId` da rota no cliente: o caso vive no navegador (token + SSE). */
export function CaseRoute() {
  const { caseId } = useParams<{ caseId: string }>();
  return <ProfileWorkspace key={caseId} caseId={caseId} />;
}
