import type { Metadata } from "next";

import { ConsentStart } from "@/components/profile/consent-start";

export const metadata: Metadata = {
  title: "Descobrir minha proteção",
  description: "Comece a conversa para montar o perfil do seu negócio.",
};

export default function ProfileStartPage() {
  return (
    <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-8 md:items-center">
      <ConsentStart />
    </div>
  );
}
