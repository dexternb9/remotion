import { Easing } from "remotion";

/**
 * Curvas predefinidas. Regla: nada lineal.
 * - Entradas → `out` (arranca rápido, frena suave).
 * - Salidas  → `in`  (arranca suave, se va rápido).
 * - Movimientos principales → `anticipate` (salida) / `overshoot` (entrada).
 */
export const EASE = {
  /** Expo-out: entradas estándar. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Quint-out más suave, para textos largos y fondos. */
  outSoft: Easing.bezier(0.22, 1, 0.36, 1),
  /** Expo-in: salidas estándar. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** Para movimientos que empiezan y terminan en pantalla. */
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  /** Cubic in-out: desplazamientos largos y elegantes (pico de velocidad moderado). */
  inOutSoft: Easing.bezier(0.65, 0, 0.35, 1),
  /** Back-out sutil: entrada con overshoot (~6 %). */
  overshoot: Easing.bezier(0.34, 1.4, 0.64, 1),
  /** Back-in sutil: pequeño retroceso antes de salir (anticipación). */
  anticipate: Easing.bezier(0.36, 0, 0.66, -0.4),
} as const;

export type EaseName = keyof typeof EASE;
