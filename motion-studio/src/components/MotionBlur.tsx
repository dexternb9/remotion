import React from "react";
import { CameraMotionBlur } from "@remotion/motion-blur";

export type MotionBlurProps = {
  children: React.ReactNode;
  /** 0–360. 180 = look cinematográfico. Más alto = más estela. */
  shutterAngle?: number;
  /** Muestras por frame (más = más suave y más lento de renderizar). */
  samples?: number;
};

/**
 * Motion blur para movimientos rápidos. Envuelve SOLO la capa que se mueve
 * rápido (no toda la escena): cada muestra re-renderiza los hijos.
 * Los hijos deben leer `useCurrentFrame()` dentro de su propio componente.
 *
 * Alternativa de mayor calidad: `<HtmlInCanvasMotionBlur>` de
 * @remotion/motion-blur (para previsualizarla en el Studio hace falta
 * Chrome 149+ con chrome://flags/#canvas-draw-element).
 */
export const MotionBlur: React.FC<MotionBlurProps> = ({
  children,
  shutterAngle = 180,
  samples = 6,
}) => (
  <CameraMotionBlur shutterAngle={shutterAngle} samples={samples}>
    {children}
  </CameraMotionBlur>
);
