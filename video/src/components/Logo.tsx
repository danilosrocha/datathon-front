import { C, FONT } from "../theme";

/** Mesma marca da aplicação (frontend/components/brand/logo.tsx), em escala livre. */
export function LogoMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill={C.sun} />
      <g fill="none" stroke={C.brand900} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 12 9.2 7h13.6L25 12" />
        <path d="M7 12a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
        <path d="M9 15.5V25h14v-9.5" />
        <path d="M14 25v-5.2h4V25" />
      </g>
    </svg>
  );
}

export function Wordmark({ size, color = C.white }: { size: number; color?: string }) {
  return (
    <span
      style={{
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.03em",
        color,
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      Negócio <span style={{ color: C.sun }}>de Pé</span>
    </span>
  );
}

export function Logo({ size }: { size: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.32 }}>
      <LogoMark size={size * 1.05} />
      <Wordmark size={size * 0.62} />
    </span>
  );
}
