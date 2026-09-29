/**
 * Zonas seguras (en px) para cada formato. Deja fuera de estas márgenes
 * cualquier texto o elemento clave: la interfaz de Reels / TikTok / Shorts
 * (usuario, caption, botones laterales) los tapa.
 *
 * Valores conservadores que cubren Reels, TikTok y Shorts a la vez.
 */
export type SafeZone = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export const SAFE_ZONES = {
  /** 1080x1920 — Reels / TikTok / Shorts / Stories. */
  vertical: { top: 260, bottom: 440, left: 70, right: 150 },
  /** 1080x1080 — feed. */
  square: { top: 80, bottom: 80, left: 80, right: 80 },
  /** 1920x1080 — YouTube / web (title-safe ~5 %). */
  landscape: { top: 60, bottom: 60, left: 100, right: 100 },
} satisfies Record<string, SafeZone>;

export type FormatName = keyof typeof SAFE_ZONES;

/** Detecta el formato a partir de las dimensiones de la composición. */
export const getFormat = (width: number, height: number): FormatName => {
  const ratio = width / height;
  if (ratio < 0.8) return "vertical";
  if (ratio > 1.25) return "landscape";
  return "square";
};

export const getSafeZone = (width: number, height: number): SafeZone =>
  SAFE_ZONES[getFormat(width, height)];
