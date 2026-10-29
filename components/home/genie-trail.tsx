"use client";

import React, { useId } from "react";

export interface GenieTrailProps {
  pathString: string;
  viewBox?: string;
  className?: string;
  pathRef: React.RefObject<SVGPathElement | null>;
  auraRef: React.RefObject<SVGPathElement | null>;
  glowRef: React.RefObject<SVGPathElement | null>;
  coreRef: React.RefObject<SVGPathElement | null>;
  headSparkRef: React.RefObject<SVGCircleElement | null>;
  sparksRef: React.RefObject<SVGGElement | null>;
  reducedMotion?: boolean;
}

/**
 * Renders the glowing BB Seguros institutional blue trail behind the Genie on the vibrant yellow Hero.
 * Uses a multi-layered stroke setup with SVG filters for rich luminescence,
 * animated via stroke-dasharray and stroke-dashoffset for 100% synchronized motion.
 */
export function GenieTrail({
  pathString,
  viewBox = "0 0 1200 620",
  className,
  pathRef,
  auraRef,
  glowRef,
  coreRef,
  headSparkRef,
  sparksRef,
  reducedMotion = false,
}: GenieTrailProps) {
  const id = useId();
  const glowFilterId = `genie-glow-${id}`;
  const bloomFilterId = `genie-bloom-${id}`;

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${className ?? ""}`}
    >
      <defs>
        {/* Soft luminous glow for the main beam */}
        <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Ambient bloom for the outer aura */}
        <filter id={bloomFilterId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="12" result="bloom" />
        </filter>
      </defs>

      {/* Hidden reference path used for length & point calculations */}
      <path
        ref={pathRef}
        d={pathString}
        fill="none"
        stroke="transparent"
        strokeWidth="1"
      />

      {reducedMotion ? (
        /* Reduced motion fallback: static subtle accent arc */
        <path
          d={pathString}
          fill="none"
          stroke="#003087"
          strokeWidth="3"
          strokeOpacity="0.25"
          strokeDasharray="180 340"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : (
        <>
          {/* Layer 1: Outer diffuse aura (wide, soft blue glow) */}
          <path
            ref={auraRef}
            d={pathString}
            fill="none"
            stroke="#3751FF"
            strokeWidth="16"
            strokeOpacity="0.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${bloomFilterId})`}
            vectorEffect="non-scaling-stroke"
            style={{ willChange: "stroke-dashoffset" }}
          />

          {/* Layer 2: Main radiant institutional BB Seguros blue beam */}
          <path
            ref={glowRef}
            d={pathString}
            fill="none"
            stroke="#003087"
            strokeWidth="5.5"
            strokeOpacity="0.95"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowFilterId})`}
            vectorEffect="non-scaling-stroke"
            style={{ willChange: "stroke-dashoffset" }}
          />

          {/* Layer 3: Inner luminous core beam */}
          <path
            ref={coreRef}
            d={pathString}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeOpacity="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ willChange: "stroke-dashoffset" }}
          />

          {/* Layer 4: Head spark (radiant orb right at the Genie's emission point) */}
          <circle
            ref={headSparkRef}
            r="6"
            cx="-100"
            cy="-100"
            fill="#FFFFFF"
            stroke="#003087"
            strokeWidth="3"
            filter={`url(#${glowFilterId})`}
            opacity="0"
            style={{ willChange: "transform, opacity" }}
          />

          {/* Layer 5: Trailing stardust / ember particles */}
          <g ref={sparksRef} opacity="0" style={{ willChange: "opacity" }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <circle
                key={i}
                data-spark-index={i}
                r={i === 0 ? 3.5 : i < 3 ? 2.5 : 1.8}
                cx="-100"
                cy="-100"
                fill={i % 2 === 0 ? "#003087" : "#3751FF"}
                opacity="0.85"
              />
            ))}
          </g>
        </>
      )}
    </svg>
  );
}
