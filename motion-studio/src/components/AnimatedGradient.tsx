import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { noise3D } from "@remotion/noise";
import { brand } from "../brand/brand";

export type AnimatedGradientProps = {
  colors?: readonly string[];
  /** Velocidad del movimiento (1 = por defecto). */
  speed?: number;
  /** Muestra la capa media de formas a la deriva (parallax). */
  midLayer?: boolean;
  /** Textura de grano encima de todo. */
  grain?: boolean;
  seed?: string;
};

/**
 * Fondo con profundidad por capas:
 *  1. Base: gradiente lineal que rota muy despacio.
 *  2. Fondo: manchas de color con movimiento orgánico (ruido) — lentas.
 *  3. Medio: anillos finos a la deriva — velocidad media (parallax).
 *  4. Grano estático para evitar banding en el render.
 */
export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({
  colors = brand.colors.gradient,
  speed = 1,
  midLayer = true,
  grain = true,
  seed = "bg",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame * speed;
  const size = Math.max(width, height);

  const angle = 160 + noise3D(seed, 0, 0, t * 0.004) * 40;
  const [base, ...blobColors] = colors;

  return (
    <AbsoluteFill style={{ backgroundColor: base, overflow: "hidden" }}>
      {/* 1. Base */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${angle}deg, ${base} 0%, ${colors[1] ?? base} 100%)`,
        }}
      />
      {/* 2. Manchas lentas */}
      {blobColors.map((color, i) => {
        const nx = noise3D(seed, i * 10, 0, t * 0.003);
        const ny = noise3D(seed, 0, i * 10, t * 0.003);
        const ns = noise3D(seed, i * 5, i * 5, t * 0.002);
        const r = size * (0.55 + ns * 0.12);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: r * 2,
              height: r * 2,
              left: width * (0.2 + 0.3 * i) + nx * width * 0.35 - r,
              top: height * (0.25 + 0.25 * i) + ny * height * 0.3 - r,
              borderRadius: "50%",
              background: `radial-gradient(circle at center, ${color}aa 0%, ${color}00 60%)`,
            }}
          />
        );
      })}
      {/* 3. Capa media: anillos a la deriva (más rápidos que el fondo) */}
      {midLayer
        ? [0, 1, 2].map((i) => {
            const d = size * (0.28 + i * 0.14);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: d,
                  height: d,
                  left:
                    width * (0.15 + i * 0.35) +
                    noise3D(`${seed}-ring`, i, 0, t * 0.008) * width * 0.2 -
                    d / 2,
                  top:
                    height * (0.2 + i * 0.3) -
                    t * (0.6 + i * 0.25) -
                    d / 2,
                  borderRadius: "50%",
                  border: `${Math.max(1, size * 0.0015)}px solid rgba(255,255,255,0.07)`,
                }}
              />
            );
          })
        : null}
      {/* 4. Grano */}
      {grain ? (
        <AbsoluteFill style={{ opacity: 0.08, mixBlendMode: "overlay" }}>
          <svg width={width} height={height}>
            <filter id="grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves={2}
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
