import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Composition,
  Folder,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import {
  Environment,
  Lightformer,
  PerspectiveCamera,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { noise2D, noise3D } from "@remotion/noise";
import { EASE, mix, progress } from "../lib";

/**
 * "Doce baldosas" — 3D cinematográfico, 9:16, 8 s @ 30 fps.
 * Sin texto, logos ni personas.
 *
 *   0–60    un único bloque de vidrio esmerilado (la carga) flota en el vacío
 *  60–140   el bloque se divide en 12 baldosas que se abren en una cuadrícula 3x4
 *           sobre una bandeja de aluminio cepillado con canto de cromo
 * 132–212   las baldosas se encienden en secuencia (como meses), proyectando
 *           cáusticas cian sobre la bandeja
 * 205–240   todo el conjunto respira con un brillo cálido unificado; plano final
 *   0–240   dolly lento + parallax de cámara (50 mm), todo con ease in-out
 *
 * 4K: npx remotion render FrostedTiles-9x16 out/FrostedTiles-9x16-4k.mp4 --scale=2
 */

type Props = {
  void: string;
  ivory: string;
  teal: string;
  ice: string;
};

const COLS = 3;
const ROWS = 4;
const TILE = 0.92;
const DEPTH = 0.16;
const GAP_BLOCK = 0.012;
const GAP_GRID = 0.2;
const SPLIT_START = 60;
const LIGHT_START = 132;
const LIGHT_EVERY = 6; // frames entre "meses"
const SWELL_START = 205;

const TILES = Array.from({ length: COLS * ROWS }, (_, i) => ({
  i,
  col: i % COLS,
  row: Math.floor(i / COLS),
}));

const splitP = (frame: number, i: number) =>
  progress(frame, SPLIT_START + i * 3, 60, EASE.inOutSoft);
const lightP = (frame: number, i: number) =>
  progress(frame, LIGHT_START + i * LIGHT_EVERY, 18, EASE.outSoft);
const swellP = (frame: number) => progress(frame, SWELL_START, 35, EASE.inOutSoft);

/** Textura radial suave (cáusticas y resplandor interno). Una sola instancia. */
let glowTexture: THREE.CanvasTexture | null = null;
const getGlowTexture = () => {
  if (glowTexture) return glowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.62)");
  g.addColorStop(0.62, "rgba(255,255,255,0.16)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  glowTexture = new THREE.CanvasTexture(c);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
};

/** Veta de aluminio cepillado (rayas horizontales finas). */
const useBrushedTexture = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 1024, 1024);
    for (let y = 0; y < 1024; y++) {
      const v = 128 + noise2D("brush", 0, y * 0.9) * 26 + noise2D("brush2", 3, y * 0.07) * 14;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, 1024, 1);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);

const Tile: React.FC<{
  i: number;
  col: number;
  row: number;
  teal: string;
  ice: string;
  ivory: string;
}> = ({ i, col, row, teal, ice, ivory }) => {
  const frame = useCurrentFrame();
  const s = splitP(frame, i);
  const l = lightP(frame, i);
  const sw = swellP(frame);
  const gap = mix(GAP_BLOCK, GAP_GRID, s);
  const step = TILE + gap;
  const lift = Math.sin(Math.PI * s); // sube y vuelve a asentarse, sin rebote
  const cx = col - (COLS - 1) / 2;
  const cy = (ROWS - 1) / 2 - row;
  // Deriva orgánica mínima, casi imperceptible.
  const drift = noise3D("tile", i, 0, frame * 0.01) * 0.012;

  return (
    <group
      position={[cx * step, cy * step, 0.1 + lift * 0.28 + drift]}
      rotation={[lift * 0.07 * cy, lift * -0.09 * cx, 0]}
    >
      {/* Vidrio esmerilado "fingido" de forma robusta (la transmisión física
          no es fiable en render por software): translúcido lechoso + clearcoat,
          y la luz interna es un mapa emisivo radial que se difumina hacia el canto. */}
      <RoundedBox args={[TILE, TILE, DEPTH]} radius={0.07} smoothness={5} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={new THREE.Color(ivory).lerp(new THREE.Color(ice), 0.35 + l * 0.25)}
          transparent
          opacity={0.84}
          roughness={0.38}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.12}
          sheen={0.6}
          sheenColor={ice}
          sheenRoughness={0.5}
          emissive={teal}
          emissiveIntensity={l * (0.28 + sw * 0.08)}
        />
      </RoundedBox>
      {/* Luz interna difundida por el esmerilado: halo radial aditivo sobre la cara */}
      <mesh position={[0, 0, DEPTH / 2 + 0.003]} visible={l > 0.002} scale={interpolate(l, [0, 1], [0.55, 1.05])}>
        <planeGeometry args={[TILE, TILE]} />
        <meshBasicMaterial
          map={getGlowTexture()}
          color={teal}
          transparent
          opacity={l * (0.95 + sw * 0.05)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

/** Bandeja de aluminio cepillado con canto de cromo + cáusticas. */
const Tray: React.FC<{ teal: string; ice: string }> = ({ teal, ice }) => {
  const frame = useCurrentFrame();
  const glow = getGlowTexture();
  const brushed = useBrushedTexture();
  const appear = progress(frame, 40, 70, EASE.inOutSoft);
  const w = COLS * (TILE + GAP_GRID) + 0.5;
  const h = ROWS * (TILE + GAP_GRID) + 0.5;
  const sw = swellP(frame);

  return (
    <group position={[0, 0, interpolate(appear, [0, 1], [-1.1, -0.28])]}>
      {/* Canto de cromo pulido */}
      <RoundedBox args={[w + 0.08, h + 0.08, 0.1]} radius={0.12} smoothness={6} receiveShadow>
        <meshPhysicalMaterial
          color="#F2F4F5"
          metalness={1}
          roughness={0.06}
          transparent
          opacity={appear}
        />
      </RoundedBox>
      {/* Superficie de aluminio cepillado */}
      <RoundedBox args={[w, h, 0.12]} radius={0.1} smoothness={6} position={[0, 0, 0.012]} receiveShadow>
        <meshPhysicalMaterial
          color="#F5F6F7"
          metalness={0.5}
          roughness={0.3}
          roughnessMap={brushed}
          bumpMap={brushed}
          bumpScale={0.45}
          transparent
          opacity={appear}
        />
      </RoundedBox>
      {/* Cáusticas: la luz de cada baldosa atraviesa el vidrio y cae en la bandeja */}
      {TILES.map(({ i, col, row }) => {
        const l = lightP(frame, i);
        const step = TILE + GAP_GRID;
        return (
          <mesh
            key={i}
            position={[
              (col - (COLS - 1) / 2) * step + 0.3,
              ((ROWS - 1) / 2 - row) * step - 0.32,
              0.08,
            ]}
            scale={interpolate(l, [0, 1], [0.8, 1.45])}
          >
            <planeGeometry args={[TILE, TILE]} />
            <meshBasicMaterial
              map={glow}
              color={i % 2 ? ice : teal}
              transparent
              opacity={l * (0.45 + sw * 0.12) * appear}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/** Cúpula del entorno con gradiente vertical (solo se usa dentro de <Environment>). */
const StudioDome: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#EDE9E2");
    g.addColorStop(0.42, "#E6E0D6");
    g.addColorStop(0.5, "#E2DBD0");
    g.addColorStop(0.62, "#B9B2A7");
    g.addColorStop(1, "#8F8A82");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh scale={50}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const t = progress(frame, 0, 240, EASE.inOutSoft);
  const target = new THREE.Vector3(0, -0.15, 0);
  return (
    <PerspectiveCamera
      makeDefault
      fov={40} // ≈ 50 mm en sensor vertical
      near={0.1}
      far={100}
      position={[mix(1.7, -0.9, t), mix(2.4, 1.5, t), mix(13.8, 12.1, t)]}
      onUpdate={(c) => c.lookAt(target)}
    />
  );
};

const Scene: React.FC<Props> = ({ teal, ice, ivory }) => {
  const frame = useCurrentFrame();
  // El bloque rota apenas mientras es "la carga"; al dividirse se asienta.
  const settle = progress(frame, SPLIT_START, 80, EASE.inOutSoft);

  return (
    <>
      <CameraRig />
      <Environment resolution={256} frames={1} environmentIntensity={0.62}>
        {/* El entorno ES el estudio: cúpula con gradiente (cenit claro → suelo tibio)
            para que vidrio y metal tengan volumen, sin negros. */}
        <StudioDome />
        {/* Key grande y suave, arriba a la izquierda, marfil cálido */}
        <Lightformer form="rect" intensity={1.6} color="#FFF6EA" position={[-6, 6, 4]} scale={[8, 6, 1]} target={[0, 0, 0]} />
        {/* Rim nítido detrás a la derecha, frío */}
        <Lightformer form="rect" intensity={2.4} color="#EAF8FF" position={[6, 2, -5]} scale={[0.6, 8, 1]} target={[0, 0, 0]} />
        {/* Relleno cenital y acento cian muy tenue */}
        <Lightformer form="rect" intensity={0.6} color="#FFFFFF" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#7FDDE6" position={[4, -3, 3]} scale={[4, 1, 1]} target={[0, 0, 0]} />
      </Environment>

      <hemisphereLight args={["#FFF8EE", "#CFC8BD", 0.2]} />
      <directionalLight
        position={[-5, 7, 6]}
        intensity={1.9}
        color="#FFF4E6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={10}
        shadow-bias={-0.0004}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[5, 2, -6]} intensity={0.7} color="#E6F6FF" />

      {/* Conjunto inclinado como una superficie de mesa */}
      <group
        rotation={[
          -0.98 + (1 - settle) * 0.14,
          (1 - settle) * (0.22 + noise3D("block", 0, 0, frame * 0.006) * 0.05),
          (1 - settle) * -0.05,
        ]}
        position={[0, interpolate(settle, [0, 1], [0.35, 0]), 0]}
      >
        <Tray teal={teal} ice={ice} />
        {TILES.map((t) => (
          <Tile key={t.i} {...t} teal={teal} ice={ice} ivory={ivory} />
        ))}
      </group>
    </>
  );
};

/** Bokeh de primer plano y fondo (profundidad de campo + parallax), en 2D. */
const Bokeh: React.FC<{ layer: "back" | "front"; teal: string; ivory: string }> = ({
  layer,
  teal,
  ivory,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = progress(frame, 0, 240, EASE.inOutSoft);
  const front = layer === "front";
  const discs = front
    ? [
        { x: 0.08, y: 0.9, r: 260, c: ivory, o: 0.55 },
        { x: 0.95, y: 0.12, r: 200, c: teal, o: 0.16 },
        { x: 0.88, y: 0.82, r: 140, c: ivory, o: 0.4 },
      ]
    : [
        { x: 0.2, y: 0.18, r: 70, c: teal, o: 0.12 },
        { x: 0.75, y: 0.3, r: 48, c: ivory, o: 0.5 },
        { x: 0.6, y: 0.08, r: 36, c: teal, o: 0.1 },
        { x: 0.3, y: 0.62, r: 40, c: ivory, o: 0.35 },
      ];
  const shift = front ? 220 : -60; // el primer plano se mueve más (parallax)

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {discs.map((d, k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: d.x * width - d.r + shift * t,
            top: d.y * height - d.r + noise3D("bokeh", k, front ? 1 : 0, frame * 0.005) * 30,
            width: d.r * 2,
            height: d.r * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${d.c} 0%, ${d.c}00 70%)`,
            opacity: d.o * progress(frame, 10, 50, EASE.outSoft),
            filter: `blur(${front ? 30 : 10}px)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const FrostedTiles: React.FC<Props> = (props) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { void: bg, ivory, teal } = props;

  return (
    <AbsoluteFill name="FrostedTiles" style={{ backgroundColor: bg }}>
      {/* Vacío de estudio: gradiente suave con caída */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 60% at 38% 30%, #FFFFFF 0%, ${bg} 55%, #E4DFD6 100%)`,
        }}
      />
      <Bokeh layer="back" teal={teal} ivory={ivory} />
      <AbsoluteFill>
        <ThreeCanvas
          width={width}
          height={height}
          shadows="soft"
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, toneMappingExposure: 0.85 }}
        >
          <Scene {...props} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* Haz volumétrico tenue desde la luz principal (arriba a la izquierda) */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(128deg, rgba(255,250,240,0.55) 0%, rgba(255,250,240,0.12) 28%, rgba(255,250,240,0) 52%)",
          mixBlendMode: "screen",
          opacity: 0.8 + noise3D("haze", 0, 0, frame * 0.01) * 0.1,
        }}
      />
      <Bokeh layer="front" teal={teal} ivory={ivory} />
      {/* Entrada desde el vacío */}
      <AbsoluteFill
        style={{
          backgroundColor: bg,
          opacity: interpolate(frame, [0, 24], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE.outSoft,
          }),
        }}
      />
    </AbsoluteFill>
  );
};

export const FrostedTilesComposition: React.FC = () => (
  <Folder name="Escenas-3D">
    <Composition
      id="FrostedTiles-9x16"
      component={FrostedTiles}
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        void: "#EFEBE4",
        ivory: "#FBF8F2",
        teal: "#2FBFC9",
        ice: "#CFEFF5",
      }}
    />
  </Folder>
);
