import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand/brand";
import { DUR, EASE, SPRING, mix, progress, springProgress } from "../lib";

export type CounterProps = {
  from?: number;
  to: number;
  startFrame?: number;
  /** Frames que tarda en llegar al valor final. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  fontSize?: number;
  color?: string;
  label?: string;
  exitAt?: number;
};

/**
 * Contador numérico con ease-out (rápido al inicio, se asienta al final),
 * cifras tabulares para que no "baile" y entrada con spring.
 */
export const Counter: React.FC<CounterProps> = ({
  from = 0,
  to,
  startFrame = 0,
  duration = DUR.xslow + DUR.slow,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "es-ES",
  fontSize = 200,
  color = brand.colors.light,
  label,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = springProgress(frame, fps, startFrame, SPRING.hero);
  const count = progress(frame, startFrame, duration, EASE.out);
  const exit =
    exitAt === undefined ? 0 : progress(frame, exitAt, DUR.fast, EASE.in);

  const value = mix(from, to, count).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: Math.min(enter, 1) * (1 - exit),
        translate: `0 ${interpolate(enter, [0, 1], [60, 0]) + interpolate(exit, [0, 1], [0, -40])}px`,
      }}
    >
      <div
        style={{
          fontFamily: brand.fonts.heading,
          fontWeight: 900,
          fontSize,
          lineHeight: 1,
          color,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.03em",
        }}
      >
        {prefix}
        {value}
        {suffix}
      </div>
      {label ? (
        <div
          style={{
            marginTop: fontSize * 0.12,
            fontFamily: brand.fonts.body,
            fontWeight: 500,
            fontSize: fontSize * 0.2,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: brand.colors.muted,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
