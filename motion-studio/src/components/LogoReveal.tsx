import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath } from "@remotion/paths";
import { makeCircle } from "@remotion/shapes";
import { brand } from "../brand/brand";
import { EASE, SPRING, SPRING_EASE, progress, springProgress } from "../lib";
import { KineticText } from "./KineticText";

export type LogoRevealProps = {
  startFrame?: number;
  /** Tamaño del isotipo en px. */
  size?: number;
  showWordmark?: boolean;
  exitAt?: number;
};

/**
 * Intro de logo: el anillo y el isotipo se dibujan con trazo, el logo hace
 * anticipación (encoge) + overshoot, el anillo sale como pulso y el
 * wordmark entra escalonado por carácter.
 */
export const LogoReveal: React.FC<LogoRevealProps> = ({
  startFrame = 0,
  size = 360,
  showWordmark = true,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = startFrame;

  const ring = makeCircle({ radius: 46 });
  const ringDraw = progress(frame, s, 26, EASE.inOut);
  const markDraw = progress(frame, s + 8, 24, EASE.inOut);
  const fill = progress(frame, s + 26, 10, EASE.out);
  const pulse = progress(frame, s + 28, 22, EASE.out);
  const exit =
    exitAt === undefined ? 0 : progress(frame, exitAt, 14, EASE.anticipate);

  const ringPath = evolvePath(ringDraw, ring.path);
  const markPath = evolvePath(markDraw, brand.logo.markPath);
  const glow = springProgress(frame, fps, s + 26, SPRING.smooth);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: size * 0.16,
        opacity: 1 - exit,
      }}
    >
      <svg
        viewBox="-4 -4 108 108"
        width={size}
        height={size}
        style={{
          overflow: "visible",
          // Anticipación (encoge a 0.92) → overshoot con spring → reposo.
          scale: interpolate(
            frame,
            [s + 22, s + 27, s + 45],
            [1, 0.92, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [EASE.out, SPRING_EASE.hero],
              output: "perceptual-scale",
            },
          ) * interpolate(exit, [0, 1], [1, 0.6]),
          filter: `drop-shadow(0 0 ${glow * 30}px ${brand.colors.primary}88)`,
        }}
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={brand.colors.primary} />
            <stop offset="1" stopColor={brand.colors.secondary} />
          </linearGradient>
        </defs>
        {/* Pulso del anillo */}
        <g
          style={{
            transformOrigin: "50px 50px",
            scale: 1 + pulse * 0.35,
            opacity: interpolate(pulse, [0, 1], [1, 0]),
          }}
        >
          <path
            d={ring.path}
            transform="translate(4 4)"
            fill="none"
            stroke={brand.colors.secondary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={ringPath.strokeDasharray}
            strokeDashoffset={ringPath.strokeDashoffset}
          />
        </g>
        {/* Fondo del isotipo */}
        <rect
          x={4}
          y={4}
          width={92}
          height={92}
          rx={24}
          fill={brand.colors.dark}
          style={{
            transformOrigin: "50px 50px",
            scale: interpolate(fill, [0, 1], [0.6, 1]),
            opacity: fill,
          }}
        />
        <path
          d={brand.logo.markPath}
          fill="none"
          stroke="url(#logo-grad)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={markPath.strokeDasharray}
          strokeDashoffset={markPath.strokeDashoffset}
        />
      </svg>
      {showWordmark ? (
        <KineticText
          text={brand.logo.wordmark}
          split="char"
          startFrame={s + 30}
          stagger={2}
          exitAt={exitAt}
          fontSize={size * 0.2}
          fontWeight={800}
          letterSpacing="0.18em"
        />
      ) : null}
    </div>
  );
};
