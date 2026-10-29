import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, ROUTES } from "@/lib/site";

/** Cabeçalho institucional: marca, duas âncoras e um único CTA. */
export function SiteHeader() {
  return (
    <header className="surface-dark sticky top-0 z-40 bg-[#5A6FFF]">
      <div className="container-page flex h-18 items-center gap-2 sm:gap-4 lg:gap-6">
        <Link
          href={ROUTES.home}
          className="-ml-1 inline-flex items-center rounded-lg p-1 transition-opacity hover:opacity-90 outline-none focus-visible:ring-3 focus-visible:ring-ring"
          aria-label="Negócio de Pé — página inicial"
        >
          <Logo tone="dark" />
        </Link>

        <nav aria-label="Principal" className="ml-auto hidden rounded-full border border-white/20 bg-white px-1 lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-brand-900 transition-colors outline-none hover:bg-brand-100/50 focus-visible:ring-3 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Button asChild variant="highlight" size="md" className="ml-auto h-11 rounded-full lg:ml-2">
          <Link href={ROUTES.profile} aria-label="Descobrir minha proteção">
            <span className="sm:hidden">Descobrir</span>
            <span className="hidden sm:inline">Descobrir minha proteção</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
