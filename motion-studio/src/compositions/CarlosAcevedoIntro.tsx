import React from "react";
import {
  AbsoluteFill,
  Composition,
  Folder,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { noise3D } from "@remotion/noise";
import {
  CARLOS_ACEVEDO_LOGO as LOGO,
  type LogoGlyph,
} from "../brand/clients/carlos-acevedo-logo";
import { MotionBlur } from "../components";
import { EASE, progress } from "../lib";

/**
 * Intro de logo premium — Carlos Acevedo Dental Center (9:16, 4 s, 30 fps).
 *
 *   0–40   el anillo y el círculo interior se dibujan en el centro del cuadro
 *  34–48   aparece el diente (overshoot sutil)
 *  44–74   el isotipo se desliza a su posición final y revela el wordmark
 *  50–94   CARLOS ACEVEDO, letra a letra (stagger 2)
 *  76–104  DENTAL CENTER se abre desde el centro (tracking)
 *  90–114  destello plateado recorre todo el logo
 *   0–120  push-in de cámara 0.965 → 1 (termina a tamaño exacto del arte)
 *
 * Las coordenadas del SVG son las del arte original (1080x1920), así que el
 * último frame coincide 1:1 con el logotipo entregado.
 */

type Props = {
  ink: string;
  background: string;
};

const RING = LOGO.ring;
const INNER = LOGO.inner;
const ICON_CX = RING.cx;
const ICON_CY = RING.cy;
const ICON_R = RING.r + RING.strokeWidth / 2;
const LOGO_CX = 535; // centro horizontal del lockup completo
const LOGO_CY = 893;
const WORDMARK = [...LOGO.carlos, ...LOGO.acevedo];
const DENTAL_CX =
  (LOGO.dental[0].cx + LOGO.dental[LOGO.dental.length - 1].cx) / 2;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Estado del isotipo en un frame: desplazamiento y escala respecto a su lugar final. */
const iconState = (frame: number) => {
  const move = progress(frame, 44, 30, EASE.inOutSoft);
  return {
    tx: interpolate(move, [0, 1], [LOGO_CX - ICON_CX, 0]),
    scale: interpolate(move, [0, 1], [1.55, 1]),
  };
};

const Glyph: React.FC<{ g: LogoGlyph; fill: string }> = ({ g, fill }) => (
  <path transform={g.transform} d={g.d} fill={fill} />
);

const Background: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const lx = width * (0.5 + noise3D("ca-light", 0, 0, frame * 0.004) * 0.18);
  const ly = height * (0.45 + noise3D("ca-light", 5, 5, frame * 0.004) * 0.08);

  return (
    <AbsoluteFill style={{ backgroundColor: color }}>
      {/* Luz principal que respira muy lento */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${lx}px ${ly}px, #FFFFFF 0%, #FFFFFF00 55%)`,
        }}
      />
      {/* Viñeta cálida muy suave */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, #00000000 45%, #2A221810 100%)",
        }}
      />
      {/* Grano fino para evitar banding */}
      <AbsoluteFill style={{ opacity: 0.035, mixBlendMode: "multiply" }}>
        <svg width={width} height={height}>
          <filter id="ca-grain">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={2} />
          </filter>
          <rect width="100%" height="100%" filter="url(#ca-grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Isotipo: anillo + círculo interior dibujados, diente, y desplazamiento. */
const Icon: React.FC<{ ink: string }> = ({ ink }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { tx, scale } = iconState(frame);

  const ringLen = 2 * Math.PI * RING.r;
  const innerLen = 2 * Math.PI * INNER.r;
  const ringDraw = progress(frame, 6, 32, EASE.inOut);
  const innerDraw = progress(frame, 16, 26, EASE.inOut);
  const tooth = progress(frame, 34, 16, EASE.overshoot);
  const toothFade = progress(frame, 34, 10, EASE.out);
  const t = LOGO.tooth;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g
          transform={`translate(${ICON_CX + tx} ${ICON_CY}) scale(${scale}) translate(${-ICON_CX} ${-ICON_CY})`}
        >
          <circle
            cx={RING.cx}
            cy={RING.cy}
            r={RING.r}
            fill="none"
            stroke={ink}
            strokeWidth={RING.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={ringLen}
            strokeDashoffset={ringLen * (1 - ringDraw)}
            transform={`rotate(-90 ${RING.cx} ${RING.cy})`}
            opacity={interpolate(ringDraw, [0, 0.04], [0, 1], CLAMP)}
          />
          <circle
            cx={INNER.cx}
            cy={INNER.cy}
            r={INNER.r}
            fill="none"
            stroke={ink}
            strokeWidth={INNER.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={innerLen}
            strokeDashoffset={innerLen * (1 - innerDraw)}
            transform={`rotate(90 ${INNER.cx} ${INNER.cy})`}
            opacity={interpolate(innerDraw, [0, 0.06], [0, 1], CLAMP)}
          />
          <g
            opacity={toothFade}
            transform={`translate(${t.cx} ${t.cy + interpolate(tooth, [0, 1], [-8, 0])}) scale(${interpolate(tooth, [0, 1], [0.6, 1])}) translate(${-t.cx} ${-t.cy})`}
          >
            <Glyph g={t} fill={ink} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Wordmark y tagline, revelados detrás del isotipo, más el destello final. */
const Wordmark: React.FC<{ ink: string }> = ({ ink }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { tx, scale } = iconState(frame);

  // El wordmark solo existe a la derecha del isotipo mientras éste se desliza.
  const clipLeft = ICON_CX + tx + ICON_R * scale + 12;

  const sheenX = interpolate(frame, [90, 114], [60, 1040], {
    ...CLAMP,
    easing: EASE.inOut,
  });
  const sheenOn = frame >= 90 && frame <= 114;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <clipPath id="ca-reveal">
            <rect x={clipLeft} y={0} width={width} height={height} />
          </clipPath>
          <linearGradient
            id="ca-sheen"
            gradientUnits="userSpaceOnUse"
            x1={sheenX - 90}
            y1={0}
            x2={sheenX + 90}
            y2={0}
            gradientTransform={`rotate(18 ${sheenX} ${LOGO_CY})`}
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.62} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
        </defs>

        <g clipPath="url(#ca-reveal)">
          {WORDMARK.map((g, i) => {
            const p = progress(frame, 50 + i * 2, 22, EASE.out);
            return (
              <g
                key={g.id}
                opacity={p}
                transform={`translate(0 ${interpolate(p, [0, 1], [16, 0])})`}
              >
                <Glyph g={g} fill={ink} />
              </g>
            );
          })}
        </g>

        {/* DENTAL CENTER: tracking que se abre desde el centro */}
        {LOGO.dental.map((g, i) => {
          const fromCenter = Math.abs(i - (LOGO.dental.length - 1) / 2);
          const p = progress(frame, 76 + fromCenter * 1.2, 26, EASE.out);
          const spread = interpolate(p, [0, 1], [0.8, 1]);
          return (
            <g
              key={g.id}
              opacity={p}
              transform={`translate(${(g.cx - DENTAL_CX) * (spread - 1)} 0)`}
            >
              <Glyph g={g} fill={ink} />
            </g>
          );
        })}

        {/* Destello plateado: banda de gradiente enmascarada por la forma del logo.
            (Con fill directo en cada glifo, el gradiente heredaría su transform.) */}
        {sheenOn ? (
          <>
            <mask id="ca-logo-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
              <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" stroke="#FFF" strokeWidth={RING.strokeWidth} />
              <circle cx={INNER.cx} cy={INNER.cy} r={INNER.r} fill="none" stroke="#FFF" strokeWidth={INNER.strokeWidth} />
              <Glyph g={LOGO.tooth} fill="#FFF" />
              {[...WORDMARK, ...LOGO.dental].map((g) => (
                <Glyph key={g.id} g={g} fill="#FFF" />
              ))}
            </mask>
            <rect
              x={0}
              y={LOGO_CY - 120}
              width={width}
              height={240}
              fill="url(#ca-sheen)"
              mask="url(#ca-logo-mask)"
            />
          </>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

export const CarlosAcevedoIntro: React.FC<Props> = ({ ink, background }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill name="CarlosAcevedoIntro">
      <Background color={background} />
      <AbsoluteFill
        name="Camara"
        style={{
          transformOrigin: `${LOGO_CX}px ${LOGO_CY}px`,
          scale: interpolate(frame, [0, 120], [0.965, 1], {
            ...CLAMP,
            easing: EASE.outSoft,
          }),
        }}
      >
        <MotionBlur shutterAngle={180} samples={12}>
          <Icon ink={ink} />
        </MotionBlur>
        <Wordmark ink={ink} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CarlosAcevedoCompositions: React.FC = () => (
  <Folder name="Carlos-Acevedo">
    <Composition
      id="CarlosAcevedo-Intro-9x16"
      component={CarlosAcevedoIntro}
      durationInFrames={120}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ ink: "#111111", background: "#F6F5F2" }}
    />
  </Folder>
);
