import React from "react";
import {
  AbsoluteFill,
  Composition,
  Folder,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "../brand/brand";
import {
  AnimatedGradient,
  KineticText,
  SafeZoneGuide,
} from "../components";
import { STAGGER, getFormat, getSafeZone, progress } from "../lib";

type BaseSceneProps = {
  title: string;
  subtitle: string;
  showSafeZones: boolean;
};

/**
 * Escena base adaptable: el mismo componente se registra en 9:16, 1:1 y 16:9
 * y ajusta tamaños y márgenes según el formato. Duplica este archivo como
 * punto de partida para piezas nuevas.
 */
export const BaseScene: React.FC<BaseSceneProps> = ({
  title,
  subtitle,
  showSafeZones,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const format = getFormat(width, height);
  const safe = getSafeZone(width, height);

  const titleSize = { vertical: 124, square: 110, landscape: 130 }[format];
  const exitAt = durationInFrames - 20;

  return (
    <AbsoluteFill name="Base">
      <AnimatedGradient />
      <AbsoluteFill
        name="Contenido"
        style={{
          paddingTop: safe.top,
          paddingBottom: safe.bottom,
          paddingLeft: safe.left,
          paddingRight: safe.right,
          justifyContent: "center",
          alignItems: format === "landscape" ? "flex-start" : "center",
          gap: titleSize * 0.35,
        }}
      >
        <KineticText
          text={title}
          startFrame={8}
          stagger={STAGGER.normal}
          exitAt={exitAt}
          fontSize={titleSize}
          align={format === "landscape" ? "left" : "center"}
        />
        <div
          style={{
            fontFamily: brand.fonts.body,
            fontWeight: 500,
            fontSize: titleSize * 0.32,
            color: brand.colors.muted,
            textAlign: format === "landscape" ? "left" : "center",
            opacity:
              progress(frame, 24, 15) * (1 - progress(frame, exitAt, 10)),
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
      <SafeZoneGuide show={showSafeZones} />
    </AbsoluteFill>
  );
};

/** Composiciones base: 9:16, 1:1 y 16:9 a 30 fps. */
export const BaseFormats: React.FC = () => (
  <Folder name="Formatos">
    <Composition
      id="Base-9x16"
      component={BaseScene}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        title: "Tu título\naquí",
        subtitle: "Formato vertical 9:16",
        showSafeZones: false,
      }}
    />
    <Composition
      id="Base-1x1"
      component={BaseScene}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{
        title: "Tu título\naquí",
        subtitle: "Formato cuadrado 1:1",
        showSafeZones: false,
      }}
    />
    <Composition
      id="Base-16x9"
      component={BaseScene}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: "Tu título\naquí",
        subtitle: "Formato horizontal 16:9",
        showSafeZones: false,
      }}
    />
  </Folder>
);
