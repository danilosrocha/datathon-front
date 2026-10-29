import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Separator } from "@/components/ui/separator";
import { NAV_LINKS, ROUTES } from "@/lib/site";

const footerLinkClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm text-ink-600 outline-none hover:text-brand-900 hover:underline underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-100 bg-white text-brand-900">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <Logo tone="light" />
          <p className="text-sm leading-relaxed text-ink-600">
            Uma forma mais simples de entender o que protege a continuidade do seu negócio.
            Protótipo desenvolvido para o Datathon BB Seguros — frente “proteger a continuidade
            do negócio”.
          </p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h2 className="mb-3 font-heading text-sm font-semibold text-brand-900">Navegue</h2>
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLinkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={ROUTES.profile} className={footerLinkClass}>
                Descobrir minha proteção
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 font-heading text-sm font-semibold text-brand-900">Institucional</h2>
          <ul className="space-y-1">
            <li>
              <a
                href="https://www.bbseguros.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className={footerLinkClass}
              >
                Site oficial da BB Seguros
                <ExternalLink className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.gov.br/susep"
                target="_blank"
                rel="noopener noreferrer"
                className={footerLinkClass}
              >
                Susep — regulação de seguros
                <ExternalLink className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-page">
        <Separator className="bg-brand-100" />
        <div className="space-y-2 py-6 text-xs leading-relaxed text-ink-600">
          <p>
            <strong className="font-semibold text-brand-900">Aviso:</strong> o Negócio de Pé é um
            protótipo acadêmico, não um canal oficial de contratação. As informações exibidas não
            constituem oferta, proposta ou cotação de seguro. Coberturas, limites e condições seguem
            as Condições Gerais do produto e as orientações oficiais da BB Seguros.
          </p>
          <p>
            Os exemplos desta página são ilustrativos. A recomendação de um caso real depende da
            verificação de elegibilidade e da confirmação dos dados informados.
          </p>
          <p>Foto: Vitaly Gariev / Unsplash.</p>
        </div>
      </div>
    </footer>
  );
}
