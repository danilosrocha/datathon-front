import { useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { FPS } from "../timeline";

/** Legenda sincronizada (mesmos blocos do SRT), dentro da área segura inferior. */
export function Captions({ blocks }: { blocks: { start: number; end: number; text: string }[] }) {
  const t = useCurrentFrame() / FPS;
  const block = blocks.find((b) => t >= b.start && t < b.end + 0.12);
  if (!block) return null;
  const fadeIn = Math.min(1, (t - block.start) / 0.12);
  const fadeOut = Math.min(1, (block.end + 0.12 - t) / 0.12);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 54,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: Math.min(fadeIn, fadeOut),
      }}
    >
      <span
        style={{
          fontFamily: FONT.body,
          fontWeight: 500,
          fontSize: 34,
          lineHeight: 1.3,
          color: C.white,
          background: "rgba(4, 10, 30, 0.78)",
          padding: "10px 22px",
          borderRadius: 12,
          maxWidth: 1300,
          textAlign: "center",
          letterSpacing: "-0.005em",
        }}
      >
        {block.text}
      </span>
    </div>
  );
}
