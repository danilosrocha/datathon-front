import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Toaster } from "@/components/ui/sonner";
import { ROUTES } from "@/lib/site";

/** Área do perfil: tela cheia, cabeçalho enxuto e sem rodapé de marketing. */
export default function ProfileLayout({ children }: LayoutProps<"/perfil">) {
  return (
    <div className="flex h-dvh flex-col bg-[#fbfcff]">
      <header className="surface-dark shrink-0 bg-[#5A6FFF]">
        <div className="container-page flex h-18 items-center gap-2 sm:gap-4 lg:gap-6">
          <Link
            href={ROUTES.home}
            className="-ml-1 inline-flex items-center rounded-lg p-1 transition-opacity hover:opacity-90 outline-none focus-visible:ring-3 focus-visible:ring-ring"
            aria-label="Negócio de Pé — página inicial"
          >
            <Logo tone="dark" />
          </Link>
        </div>
      </header>
      <main id="conteudo" className="flex min-h-0 flex-1 flex-col">
        {children}
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
