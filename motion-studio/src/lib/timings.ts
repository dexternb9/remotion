/** FPS del proyecto. Todas las composiciones base usan 30 fps. */
export const FPS = 30;

/** Segundos → frames. */
export const sec = (seconds: number, fps: number = FPS) =>
  Math.round(seconds * fps);

/** Duraciones estándar en frames (a 30 fps). */
export const DUR = {
  micro: 6, // 0.2 s — cambios de color, pequeños acentos
  fast: 10, // 0.33 s — salidas, elementos pequeños
  base: 15, // 0.5 s — entradas estándar
  slow: 24, // 0.8 s — movimientos principales
  xslow: 36, // 1.2 s — revelados de logo, fondos
} as const;

/** Escalonado entre elementos hermanos (regla: 2–5 frames). */
export const STAGGER = {
  tight: 2, // caracteres
  normal: 3, // palabras
  loose: 5, // bloques / líneas
} as const;

/** Duración típica de transición entre escenas. */
export const TRANSITION_FRAMES = 18;
