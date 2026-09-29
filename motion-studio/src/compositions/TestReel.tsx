import React from "react";
import {
  AbsoluteFill,
  Composition,
  Folder,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "../brand/brand";
import {
  AnimatedGradient,
  KineticText,
  LowerThird,
  MotionBlur,
  PanelWipe,
  SafeZoneGuide,
} from "../components";
import { EASE, getSafeZone, progress } from "../lib";

type TestReelProps = {
  kicker: string;
  title: string;
  highlight: string[];
  name: string;
  role: string;
  showSafeZones: boolean;
};

/**
 * Timeline (30 fps, 180 frames = 6 s):
 *   0–180  fondo con gradiente en movimiento (capas lenta/media)
 *   4      kicker por caracteres
 *  10      título, palabras escalonadas cada 4 frames, con motion blur
 *  62      lower third entra → el título cede el foco (baja escala/opacidad)
 * 122–134  salida escalonada: lower third, título, kicker (ease-in)
 * 138–166  transición de salida: 3 paneles escalonados cubren la escena
 * 160–180  logo sobre el panel final
 */
export const TestReel: React.FC<TestReelProps> = ({
  kicker,
  title,
  highlight,
  name,
  role,
  showSafeZones,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill name="TestReel" style={{ backgroundColor: brand.colors.dark }}>
      <AnimatedGradient seed="test-reel" />

      {/* Motion blur sobre la capa rápida (titular). CameraMotionBlur usa
          AbsoluteFill, así que el layout vive dentro de <Headline>. */}
      <MotionBlur shutterAngle={200} samples={6}>
        <Headline kicker={kicker} title={title} highlight={highlight} />
      </MotionBlur>

      <LowerThird name={name} title={role} startFrame={62} exitAt={122} />

      <PanelWipe startFrame={138} mode="out" stagger={4} duration={20}>
        <Img
          src={staticFile(brand.logo.src)}
          style={{
            width: 260,
            height: 260,
            scale: interpolate(frame, [158, 176], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE.overshoot,
              output: "perceptual-scale",
            }),
          }}
        />
      </PanelWipe>

      <SafeZoneGuide show={showSafeZones} />
    </AbsoluteFill>
  );
};

/** Kicker + título. Lee el frame por dentro para que cada muestra del blur sea distinta. */
const Headline: React.FC<Pick<TestReelProps, "kicker" | "title" | "highlight">> = ({
  kicker,
  title,
  highlight,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const safe = getSafeZone(width, height);

  // Un solo foco: cuando entra el lower third, el título retrocede un poco.
  const yieldFocus = progress(frame, 62, 18, EASE.outSoft);

  return (
    <AbsoluteFill
      name="Titular"
      style={{
        paddingTop: safe.top,
        paddingBottom: safe.bottom + 240,
        paddingLeft: safe.left,
        paddingRight: safe.right,
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 36,
        opacity: interpolate(yieldFocus, [0, 1], [1, 0.82]),
        scale: interpolate(yieldFocus, [0, 1], [1, 0.96]),
        transformOrigin: `${safe.left}px center`,
      }}
    >
      <KineticText
        text={kicker}
        split="char"
        startFrame={4}
        stagger={2}
        exitAt={134}
        fontSize={34}
        fontWeight={700}
        letterSpacing="0.3em"
        color={brand.colors.secondary}
        fontFamily={brand.fonts.body}
        align="left"
      />
      <KineticText
        text={title}
        startFrame={10}
        stagger={4}
        exitAt={126}
        fontSize={128}
        highlight={highlight}
        align="left"
      />
    </AbsoluteFill>
  );
};

export const TestReelComposition: React.FC = () => (
  <Folder name="Pruebas">
    <Composition
      id="TestReel-9x16"
      component={TestReel}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        kicker: "MOTION STUDIO",
        title: "Crea\nmovimiento\ncon intención",
        highlight: ["intención"],
        name: "Motion Studio",
        role: "Prueba de sistema · 9:16",
        showSafeZones: false,
      }}
    />
  </Folder>
);
