export const ROUTES = {
  home: "/",
  profile: "/perfil",
} as const;

export const SECTION_IDS = {
  howItWorks: "como-funciona",
  businesses: "para-seu-negocio",
} as const;

export const NAV_LINKS = [
  { href: `/#${SECTION_IDS.howItWorks}`, label: "Como funciona" },
  { href: `/#${SECTION_IDS.businesses}`, label: "Para o seu negócio" },
] as const;

export function caseHref(caseId: string) {
  return `${ROUTES.profile}/${caseId}`;
}
