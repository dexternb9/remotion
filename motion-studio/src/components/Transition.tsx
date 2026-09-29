import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { brand } from "../brand/brand";
import { DUR, EASE, SPRING, TRANSITION_FRAMES, progress } from "../lib";

/**
 * Presets para <TransitionSeries.Transition {...TRANSITIONS.slideUp} />.
 * Todos usan springTiming (nada lineal).
 */
const timing = springTiming({
  config: SPRING.smooth,
  durationInFrames: TRANSITION_FRAMES,
});

export const TRANSITIONS = {
  fade: { presentation: fade(), timing },
  slideUp: { presentation: slide({ direction: "from-bottom" }), timing },
  slideLeft: { presentation: slide({ direction: "from-right" }), timing },
  wipeUp: { presentation: wipe({ direction: "from-bottom" }), timing },
  wipeDiagonal: { presentation: wipe({ direction: "from-bottom-left" }), timing },
};

export type PanelWipeProps = {
  /** Frame en que empieza la transición. */
  startFrame: number;
  /**
   * "out": los paneles cubren la escena y se quedan (salida / final).
   * "in": los paneles empiezan cubriendo y se retiran (entrada).
   * "through": cubren y se retiran (corte a mitad de transición).
   */
  mode?: "out" | "in" | "through";
  direction?: "up" | "left";
  colors?: string[];
  /** Frames entre paneles. */
  stagger?: number;
  /** Duración de cada panel. */
  duration?: number;
  /** Frames que la pantalla queda cubierta en modo "through". */
  hold?: number;
  children?: React.ReactNode;
};

/**
 * Transición por paneles de color escalonados. Úsala como capa superior
 * de una escena. `children` se muestra encima del último panel (p. ej. el logo
 * en un cierre).
 */
export const PanelWipe: React.FC<PanelWipeProps> = ({
  startFrame,
  mode = "out",
  direction = "up",
  colors = [brand.colors.secondary, brand.colors.primary, brand.colors.dark],
  stagger = 4,
  duration = DUR.slow,
  hold = 4,
  children,
}) => {
  const frame = useCurrentFrame();
  const axis = direction === "up" ? "Y" : "X";
  const lastCovered = startFrame + (colors.length - 1) * stagger + duration;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {colors.map((color, i) => {
        const enterAt = startFrame + i * stagger;
        const covering =
          mode === "in" ? 1 : progress(frame, enterAt, duration, EASE.inOut);
        const leaveAt =
          mode === "in"
            ? startFrame + (colors.length - 1 - i) * stagger
            : lastCovered + hold + (colors.length - 1 - i) * stagger;
        const leaving =
          mode === "out" ? 0 : progress(frame, leaveAt, duration, EASE.inOut);

        const pos = interpolate(covering, [0, 1], [100, 0]) +
          interpolate(leaving, [0, 1], [0, -100]);

        return (
          <AbsoluteFill
            key={i}
            style={{
              backgroundColor: color,
              translate: axis === "Y" ? `0 ${pos}%` : `${pos}% 0`,
            }}
          />
        );
      })}
      {children ? (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: mode === "in" ? 0 : progress(frame, lastCovered - 6, DUR.base),
          }}
        >
          {children}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
