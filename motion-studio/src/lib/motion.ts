import { interpolate, spring, type SpringConfig } from "remotion";
import { EASE } from "./easings";
import { DUR } from "./timings";

type EasingFn = (t: number) => number;

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Progreso 0→1 entre `start` y `start + duration` con easing (ease-out por defecto). */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: EasingFn = EASE.out,
) => interpolate(frame, [start, start + duration], [0, 1], { ...CLAMP, easing });

/** Progreso 0→1 con física de spring, arrancando en `start`. */
export const springProgress = (
  frame: number,
  fps: number,
  start: number,
  config: Partial<SpringConfig>,
  durationInFrames?: number,
) => spring({ frame: frame - start, fps, config, durationInFrames });

/** Interpolación lineal entre `a` y `b` (usa con un progreso ya "easeado"). */
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export type EnterExit = {
  /** Frame donde empieza la entrada. */
  enterAt: number;
  enterDuration?: number;
  enterEasing?: EasingFn;
  /** Frame donde empieza la salida. Omitir = no sale. */
  exitAt?: number;
  exitDuration?: number;
  exitEasing?: EasingFn;
};

/**
 * Devuelve { in, out } — ambos 0→1 — para un elemento que entra (ease-out)
 * y sale (ease-in). `presence = in * (1 - out)` sirve para opacidad.
 */
export const enterExit = (frame: number, o: EnterExit) => {
  const inP = progress(
    frame,
    o.enterAt,
    o.enterDuration ?? DUR.base,
    o.enterEasing ?? EASE.out,
  );
  const outP =
    o.exitAt === undefined
      ? 0
      : progress(
          frame,
          o.exitAt,
          o.exitDuration ?? DUR.fast,
          o.exitEasing ?? EASE.in,
        );
  return { in: inP, out: outP, presence: inP * (1 - outP) };
};
