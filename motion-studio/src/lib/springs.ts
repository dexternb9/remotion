import { Easing, type SpringConfig } from "remotion";

/**
 * Configuraciones de spring para `spring({ frame, fps, config })`.
 * Úsalas por nombre para mantener un lenguaje de movimiento coherente.
 */
export const SPRING = {
  /** Sin rebote, empuje limpio. Textos y UI. */
  smooth: { damping: 200 },
  /** Rápido y firme, rebote mínimo. Elementos pequeños, íconos. */
  snappy: { damping: 20, stiffness: 200 },
  /** Overshoot sutil. Movimiento principal / héroe. */
  hero: { damping: 14, stiffness: 120, mass: 0.9 },
  /** Rebote visible. Úsalo con moderación (logos, stickers). */
  bouncy: { damping: 9, stiffness: 150 },
  /** Pesado y lento. Capas de fondo, grandes superficies. */
  heavy: { damping: 30, stiffness: 60, mass: 2 },
} satisfies Record<string, Partial<SpringConfig>>;

export type SpringName = keyof typeof SPRING;

/** Versiones como easing para `interpolate(..., { easing })`. */
export const SPRING_EASE = {
  smooth: Easing.spring(SPRING.smooth),
  snappy: Easing.spring(SPRING.snappy),
  hero: Easing.spring(SPRING.hero),
  bouncy: Easing.spring(SPRING.bouncy),
  heavy: Easing.spring(SPRING.heavy),
} as const;
