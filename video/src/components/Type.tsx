import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { exit, reveal } from "./anim";

/** Título grande de cena, com entrada e saída suaves. */
export function Title({
  children,
  start,
  end = Infinity,
  size = 84,
  style,
}: {
  children: ReactNode;
  start: number;
  end?: number;
  size?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const r = reveal(frame, start, 0.9, 28);
  return (
    <div
      style={{
        fontFamily: FONT.display,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: "-0.035em",
        color: C.white,
        textWrap: "balance",
        ...r,
        opacity: r.opacity * exit(frame, end),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Frase de apoio sobre a captura: cartão escuro com barra amarela. */
export function Callout({
  children,
  start,
  end = Infinity,
  style,
  size = 44,
}: {
  children: ReactNode;
  start: number;
  end?: number;
  style?: CSSProperties;
  size?: number;
}) {
  const frame = useCurrentFrame();
  const r = reveal(frame, start, 0.7, 18);
  const opacity = r.opacity * exit(frame, end, 0.5);
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "22px 34px 22px 26px",
        borderRadius: 20,
        background: "rgba(4, 10, 30, 0.86)",
        boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(198,206,255,0.12)",
        ...r,
        opacity,
        ...style,
      }}
    >
      <span style={{ width: 6, alignSelf: "stretch", borderRadius: 9, background: C.sun }} />
      <span
        style={{
          fontFamily: FONT.display,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.15,
          letterSpacing: "-0.025em",
          color: C.white,
        }}
      >
        {children}
      </span>
    </div>
  );
}

/** Selo de estado do fato, idêntico ao da aplicação (FactCard). */
export function StatusPill({ status, scale = 1 }: { status: "estimado" | "confirmado" | "observado"; scale?: number }) {
  const styles: Record<string, CSSProperties> = {
    estimado: { background: "rgba(252, 238, 79, 0.25)", border: `${2 * scale}px dashed ${C.sun}`, color: C.brand900 },
    confirmado: { background: "rgba(106, 237, 211, 0.35)", color: C.brand900 },
    observado: { background: C.brand100, color: "#1F3BC4" },
  };
  const label = { estimado: "Estimado", confirmado: "Confirmado", observado: "Disponível" }[status];
  return (
    <span
      style={{
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: 22 * scale,
        padding: `${4 * scale}px ${14 * scale}px`,
        borderRadius: 999,
        whiteSpace: "nowrap",
        ...styles[status],
      }}
    >
      {label}
    </span>
  );
}
