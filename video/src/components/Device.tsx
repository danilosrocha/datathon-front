import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { FPS, type ClipName, sec } from "../timeline";
import { cameraAt, progress, type CamKey } from "./anim";

/*
 * Janela de navegador com as capturas reais da aplicação. Tudo o que fica
 * dentro (vídeo e destaques) usa coordenadas da captura (1440 × 810), e a
 * câmera aproxima o aparelho inteiro — como um movimento de câmera, não um
 * recorte do vídeo — para manter a continuidade espacial entre as cenas.
 */

export const CAPTURE = { w: 1440, h: 810 };
const CONTENT_W = 1472;
const S0 = CONTENT_W / CAPTURE.w;
const CHROME_H = 40;
const LEFT = (1920 - CONTENT_W) / 2;
const TOP = 52;
const CONTENT_TOP = TOP + CHROME_H;
const CENTER = { x: 960, y: CONTENT_TOP + (CAPTURE.h * S0) / 2 };

export interface Shot {
  clip: ClipName;
  /** Trecho da captura, em segundos. */
  from: number;
  to: number;
  /** Segundo da cena em que o trecho começa. */
  at: number;
  rate?: number;
}

export const shotLength = (shot: Shot) => (shot.to - shot.from) / (shot.rate ?? 1);

const XFADE = 0.3;

export interface DeviceProps {
  shots: Shot[];
  camera?: CamKey[];
  /** Destaques em coordenadas da captura. */
  children?: ReactNode;
  /** Transformação extra do aparelho inteiro (entrada/saída da cena). */
  frameStyle?: CSSProperties;
  badge?: string;
  /** Escurece o conteúdo (0–1) para dar foco a um texto sobreposto. */
  dim?: number;
}

export function Device({ shots, camera, children, frameStyle, badge, dim = 0 }: DeviceProps) {
  const frame = useCurrentFrame();
  const cam = cameraAt(camera ?? [{ t: 0, x: CAPTURE.w / 2, y: CAPTURE.h / 2, z: 1 }], frame / FPS);
  const fx = LEFT + cam.x * S0;
  const fy = CONTENT_TOP + cam.y * S0;
  const worldTransform = `translate(${CENTER.x - cam.z * fx}px, ${CENTER.y - cam.z * fy}px) scale(${cam.z})`;

  return (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: worldTransform }}>
      <div
        style={{
          position: "absolute",
          left: LEFT,
          top: TOP,
          width: CONTENT_W,
          height: CHROME_H + CAPTURE.h * S0,
          borderRadius: 18,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 40px 120px -30px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(198, 206, 255, 0.14)",
          transformOrigin: "50% 50%",
          ...frameStyle,
        }}
      >
        <Chrome badge={badge} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: CHROME_H,
            width: CAPTURE.w,
            height: CAPTURE.h,
            transform: `scale(${S0})`,
            transformOrigin: "0 0",
            overflow: "hidden",
            background: "#F5F7FF",
          }}
        >
          {shots.map((shot, i) => (
            <Sequence
              key={`${shot.clip}-${shot.from}-${i}`}
              from={sec(shot.at)}
              durationInFrames={sec(shotLength(shot) + (i < shots.length - 1 ? XFADE : 0))}
              layout="none"
            >
              <ShotLayer shot={shot} fadeIn={i > 0} />
            </Sequence>
          ))}
          {dim > 0 && <AbsoluteFill style={{ background: `rgba(4, 10, 30, ${dim})` }} />}
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ShotLayer({ shot, fadeIn }: { shot: Shot; fadeIn: boolean }) {
  const frame = useCurrentFrame();
  const opacity = fadeIn ? progress(frame, 0, XFADE) : 1;
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={staticFile(`capture/${shot.clip}.mp4`)}
        trimBefore={sec(shot.from)}
        playbackRate={shot.rate ?? 1}
        muted
        style={{ width: CAPTURE.w, height: CAPTURE.h }}
      />
    </AbsoluteFill>
  );
}

function Chrome({ badge }: { badge?: string }) {
  return (
    <div
      style={{
        height: CHROME_H,
        background: "#0D1840",
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        gap: 8,
        position: "relative",
      }}
    >
      {["#FF6F68", "#FCEE4F", "#6AEDD3"].map((color) => (
        <span key={color} style={{ width: 12, height: 12, borderRadius: 99, background: color, opacity: 0.85 }} />
      ))}
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: FONT.body,
          fontSize: 15,
          color: "rgba(229, 232, 255, 0.8)",
          background: "rgba(255,255,255,0.07)",
          padding: "5px 18px",
          borderRadius: 99,
          letterSpacing: "0.01em",
        }}
      >
        Negócio de Pé · captura real do protótipo
      </span>
      {badge && (
        <span
          style={{
            marginLeft: "auto",
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 14,
            color: C.brand900,
            background: C.sun,
            padding: "4px 12px",
            borderRadius: 99,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/** Contorno de destaque sobre uma região da captura. */
export function Spot({
  x,
  y,
  w,
  h,
  start,
  end,
  radius = 14,
  color = C.sun,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  start: number;
  end: number;
  radius?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const inP = progress(frame, start, 0.5);
  const outP = progress(frame, end, 0.4);
  const opacity = inP * (1 - outP);
  if (opacity <= 0) return null;
  const grow = 10 * (1 - inP);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 6 - grow,
        top: y - 6 - grow,
        width: w + 12 + grow * 2,
        height: h + 12 + grow * 2,
        borderRadius: radius,
        border: `3px solid ${color}`,
        boxShadow: `0 0 0 6px ${color}33`,
        opacity,
      }}
    />
  );
}
