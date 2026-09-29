/**
 * SISTEMA DE MARCA — único archivo a editar para cambiar la identidad.
 *
 * - Colores: cambia los hex de `colors`.
 * - Tipografías: cambia las dos líneas `import { loadFont ... }` por otra
 *   familia de @remotion/google-fonts (p. ej. "@remotion/google-fonts/Poppins").
 *   Para una fuente local, ponla en public/assets/fonts y usa @remotion/fonts.
 * - Logo: reemplaza public/assets/logo.svg y, si quieres que LogoReveal
 *   dibuje el trazo, pega el `d` del path principal en `logo.markPath`.
 */
import { loadFont as loadHeading } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const heading = loadHeading("normal", {
  weights: ["600", "800", "900"],
  subsets: ["latin", "latin-ext"],
});

const body = loadBody("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin", "latin-ext"],
});

export const brand = {
  name: "Motion Studio",

  colors: {
    primary: "#6C5CE7",
    secondary: "#00D2D3",
    accent: "#FF6B6B",
    dark: "#0B0B14",
    darkAlt: "#161630",
    light: "#F5F5FA",
    muted: "#A3A3C2",
    /** Paradas del gradiente de fondo animado (de oscuro a claro). */
    gradient: ["#0B0B14", "#1E1450", "#6C5CE7", "#00D2D3"],
  },

  fonts: {
    heading: heading.fontFamily,
    body: body.fontFamily,
  },

  logo: {
    /** Archivo estático, usar con staticFile(brand.logo.src). */
    src: "assets/logo.svg",
    /** Path SVG del isotipo (viewBox 0 0 100 100) que LogoReveal dibuja. */
    markPath: "M22 76 L22 24 L50 56 L78 24 L78 76",
    viewBox: "0 0 100 100",
    wordmark: "MOTION STUDIO",
  },

  radius: 24,
} as const;

export type Brand = typeof brand;
