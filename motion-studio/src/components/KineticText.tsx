import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand/brand";
import { EASE, SPRING, STAGGER, progress, springProgress } from "../lib";

export type KineticTextProps = {
  text: string;
  /** Unidad que se escalona. "\n" en `text` fuerza salto de línea. */
  split?: "word" | "char";
  startFrame?: number;
  /** Frames entre unidades (2–5). */
  stagger?: number;
  /** Frame en que empieza la salida escalonada. Omitir = no sale. */
  exitAt?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  /** Palabras (sin puntuación) que se pintan con el color de acento. */
  highlight?: string[];
  highlightColor?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: string;
  fontFamily?: string;
  style?: React.CSSProperties;
};

/**
 * Texto cinético: cada palabra/carácter sube desde una máscara con spring
 * (overshoot sutil) y sale escalonado con anticipación (ease-in-back).
 */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  split = "word",
  startFrame = 0,
  stagger = split === "char" ? STAGGER.tight : STAGGER.normal,
  exitAt,
  fontSize = 120,
  fontWeight = 900,
  color = brand.colors.light,
  highlight = [],
  highlightColor = brand.colors.secondary,
  align = "center",
  lineHeight = 1.02,
  letterSpacing = "-0.02em",
  fontFamily = brand.fonts.heading,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const highlightSet = new Set(highlight.map((w) => w.toLowerCase()));

  const lines = text.split("\n").map((line) => line.trim().split(/\s+/));
  let unitIndex = 0;

  const renderUnit = (content: string, i: number, accent: boolean) => {
    const enter = springProgress(frame, fps, startFrame + i * stagger, SPRING.hero);
    // La salida va en el mismo orden para que el ojo lea de izquierda a derecha.
    const exit =
      exitAt === undefined
        ? 0
        : progress(frame, exitAt + i * Math.max(1, stagger - 1), 12, EASE.anticipate);

    return (
      <span
        style={{
          display: "inline-block",
          overflow: "hidden",
          // Holgura para que el overshoot y los descendentes no se corten.
          padding: "0.08em 0.02em 0.14em",
          margin: "-0.08em -0.02em -0.14em",
          verticalAlign: "top",
        }}
      >
        <span
          style={{
            display: "inline-block",
            color: accent ? highlightColor : color,
            translate: `0 ${interpolate(enter, [0, 1], [110, 0]) + interpolate(exit, [0, 1], [0, -115])}%`,
            rotate: `${interpolate(enter, [0, 1], [8, 0]) + interpolate(exit, [0, 1], [0, -4])}deg`,
            opacity: Math.min(
              interpolate(enter, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }),
              1 - exit,
            ),
          }}
        >
          {content}
        </span>
      </span>
    );
  };

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        textAlign: align,
        textTransform: "none",
        ...style,
      }}
    >
      {lines.map((words, li) => (
        <div key={li}>
          {words.map((word, wi) => {
            const accent = highlightSet.has(
              word.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase(),
            );
            const node =
              split === "word"
                ? renderUnit(word, unitIndex++, accent)
                : [...word].map((ch, ci) => (
                    <React.Fragment key={ci}>
                      {renderUnit(ch, unitIndex++, accent)}
                    </React.Fragment>
                  ));
            return (
              <React.Fragment key={wi}>
                <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                  {node}
                </span>
                {wi < words.length - 1 ? " " : null}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Frame en que termina la entrada de un KineticText (útil para encadenar). */
export const kineticEnd = (
  text: string,
  startFrame = 0,
  stagger: number = STAGGER.normal,
  split: "word" | "char" = "word",
) => {
  const units = text
    .split(/\s+/)
    .filter(Boolean)
    .reduce((n, w) => n + (split === "char" ? w.length : 1), 0);
  return startFrame + (units - 1) * stagger + 20;
};
