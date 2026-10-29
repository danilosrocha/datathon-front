import type { Metadata } from "next";
import { Suspense } from "react";

import { CaseRoute } from "@/components/profile/case-route";

export const metadata: Metadata = {
  title: "Traçado de perfil",
};

export default function CasePage() {
  return (
    <Suspense>
      <CaseRoute />
    </Suspense>
  );
}
