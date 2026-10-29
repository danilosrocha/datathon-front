import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-sun-400 px-4 py-2 font-semibold text-brand-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
