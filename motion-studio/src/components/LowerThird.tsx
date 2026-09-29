import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand/brand";
import { EASE, SPRING, getSafeZone, progress, springProgress } from "../lib";

export type LowerThirdProps = {
  name: string;
  title?: string;
  startFrame?: number;
  /** Frame en que empieza la salida (orden inverso a la entrada). */
  exitAt?: number;
  accentColor?: string;
  /** Distancia extra sobre la zona segura inferior, en px. */
  bottomOffset?: number;
};

/**
 * Rótulo inferior: barra de acento → panel (wipe) → nombre → cargo,
 * escalonado. Sale en orden inverso con ease-in. Se posiciona dentro
 * de la zona segura del formato automáticamente.
 */
export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  title,
  startFrame = 0,
  exitAt,
  accentColor = brand.colors.secondary,
  bottomOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const safe = getSafeZone(width, height);
  const u = Math.min(width, height) / 1080; // escala relativa al formato

  const s = startFrame;
  const bar = springProgress(frame, fps, s, SPRING.snappy);
  const panel = progress(frame, s + 3, 16, EASE.out);
  const nameIn = springProgress(frame, fps, s + 6, SPRING.smooth);
  const titleIn = springProgress(frame, fps, s + 10, SPRING.smooth);

  // Salida inversa: cargo → nombre → panel → barra.
  const out = (delay: number) =>
    exitAt === undefined ? 0 : progress(frame, exitAt + delay, 10, EASE.in);
  const titleOut = out(0);
  const nameOut = out(2);
  const panelOut = out(5);
  const barOut = out(9);

  return (
    <div
      style={{
        position: "absolute",
        left: safe.left,
        bottom: safe.bottom + bottomOffset,
        display: "flex",
        alignItems: "stretch",
        gap: 20 * u,
        maxWidth: width - safe.left - safe.right,
      }}
    >
      <div
        style={{
          width: 10 * u,
          borderRadius: 10 * u,
          backgroundColor: accentColor,
          transformOrigin: "bottom",
          scale: `1 ${bar * (1 - barOut)}`,
        }}
      />
      <div
        style={{
          padding: `${22 * u}px ${34 * u}px ${24 * u}px`,
          borderRadius: 18 * u,
          backgroundColor: "rgba(11, 11, 20, 0.72)",
          border: `1px solid rgba(255,255,255,0.08)`,
          clipPath: `inset(0 ${(1 - panel * (1 - panelOut)) * 100}% 0 0 round ${18 * u}px)`,
        }}
      >
        <div
          style={{
            fontFamily: brand.fonts.heading,
            fontWeight: 800,
            fontSize: 58 * u,
            lineHeight: 1.05,
            color: brand.colors.light,
            whiteSpace: "nowrap",
            opacity: nameIn * (1 - nameOut),
            translate: `${interpolate(nameIn, [0, 1], [-40 * u, 0]) + interpolate(nameOut, [0, 1], [0, -30 * u])}px 0`,
          }}
        >
          {name}
        </div>
        {title ? (
          <div
            style={{
              marginTop: 8 * u,
              fontFamily: brand.fonts.body,
              fontWeight: 500,
              fontSize: 34 * u,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: accentColor,
              whiteSpace: "nowrap",
              opacity: titleIn * (1 - titleOut),
              translate: `${interpolate(titleIn, [0, 1], [-30 * u, 0]) + interpolate(titleOut, [0, 1], [0, -24 * u])}px 0`,
            }}
          >
            {title}
          </div>
        ) : null}
      </div>
    </div>
  );
};
