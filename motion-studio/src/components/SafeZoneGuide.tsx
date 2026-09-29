import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { getSafeZone } from "../lib";

/**
 * Superpone en rojo las zonas que tapa la interfaz de las redes.
 * Actívalo con la prop `showSafeZones` en el Studio; no lo dejes en el render final.
 */
export const SafeZoneGuide: React.FC<{ show?: boolean }> = ({ show = true }) => {
  const { width, height } = useVideoConfig();
  if (!show) return null;
  const z = getSafeZone(width, height);
  const tint = "rgba(255, 60, 60, 0.28)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: z.top, background: tint }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: z.bottom, background: tint }} />
      <div style={{ position: "absolute", left: 0, top: z.top, bottom: z.bottom, width: z.left, background: tint }} />
      <div style={{ position: "absolute", right: 0, top: z.top, bottom: z.bottom, width: z.right, background: tint }} />
      <div
        style={{
          position: "absolute",
          left: z.left,
          right: z.right,
          top: z.top,
          bottom: z.bottom,
          border: "2px dashed rgba(255,255,255,0.6)",
        }}
      />
    </AbsoluteFill>
  );
};
