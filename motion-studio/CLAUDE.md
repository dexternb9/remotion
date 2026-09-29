# Motion Studio — reglas para Claude

Proyecto Remotion (v4.0.530, React 19, TypeScript, Tailwind v4) para motion
graphics de alta calidad: intros de logo, lower thirds, texto cinético,
transiciones, gráficas animadas y piezas para redes en 9:16, 1:1 y 16:9.

Los skills oficiales de Remotion están en `.claude/skills/` (empieza por
`remotion-best-practices`). Consúltalos antes de usar una API de Remotion.

## Estructura

```
src/
  brand/brand.ts        ← ÚNICO archivo de marca: colores, tipografías, logo
  lib/                  ← easings.ts, springs.ts, timings.ts, safe-zones.ts, motion.ts
  components/           ← KineticText, LowerThird, LogoReveal, Counter,
                          Transition (TRANSITIONS + PanelWipe), AnimatedGradient,
                          MotionBlur, SafeZoneGuide
  compositions/         ← un archivo por pieza: componente + <Composition> juntos
  Root.tsx              ← solo importa y monta las composiciones
public/assets/          ← logo.svg, fonts/, images/, audio/, lottie/, video/
out/                    ← renders (ignorado por git)
```

- Nunca hardcodees colores ni fuentes: usa `brand.colors.*` y `brand.fonts.*`.
- Duraciones, stagger y curvas salen de `src/lib` (`DUR`, `STAGGER`, `EASE`, `SPRING`).
- Composiciones nuevas: 30 fps, dimensiones 1080x1920 / 1080x1080 / 1920x1080,
  registradas en su `<Folder>`, con `defaultProps` inline en el `<Composition>`.
- Instala paquetes con `npx remotion add <paquete>`: todas las versiones de
  `@remotion/*` deben coincidir exactamente con `remotion`. Compruébalo con
  `npx remotion versions`.
- Anima SIEMPRE con `useCurrentFrame()` + `interpolate()`/`spring()`. Nada de
  transiciones/animaciones CSS ni clases `animate-*` de Tailwind (no se renderizan).

## Reglas de motion (obligatorias)

1. **Nada lineal.** Todo entra y sale con spring o easing:
   entradas con ease-out (`EASE.out`, `SPRING.smooth`), salidas con ease-in
   (`EASE.in`). `Easing.linear` solo para valores que no son movimiento
   (p. ej. un tramo "hold" entre keyframes).
2. **Stagger de 2 a 5 frames.** Nunca animes un grupo a la vez: caracteres
   `STAGGER.tight` (2), palabras `STAGGER.normal` (3), bloques `STAGGER.loose` (5).
3. **Anticipación y overshoot sutil** en el movimiento principal:
   `SPRING.hero` / `EASE.overshoot` al entrar, `EASE.anticipate` al salir.
   Overshoot ≤ ~8 %; nada de rebotes exagerados salvo que se pida.
4. **Jerarquía: un solo foco por momento.** Cuando entra un elemento nuevo
   importante, el anterior cede (baja opacidad/escala o sale). No compitas
   dos animaciones protagonistas en el mismo frame.
5. **Profundidad por capas:** fondo con movimiento lento (`AnimatedGradient`,
   `SPRING.heavy`), capa media a velocidad media, primer plano con el
   movimiento principal. Cada capa a su propia velocidad (parallax).
6. **Motion blur en movimientos rápidos:** envuelve SOLO la capa rápida con
   `<MotionBlur>` (no la escena entera: multiplica el coste de render).
7. **Tipografía legible en móvil:** textos cortos (≤ 6 palabras por pantalla
   en 9:16), titulares ≥ 100 px, secundarios ≥ 34 px a 1080 de ancho,
   contraste alto, máximo 3 líneas por bloque.
8. **Zonas seguras en 9:16:** nada importante fuera de `SAFE_ZONES.vertical`
   (arriba 260, abajo 440, izquierda 70, derecha 150 px). Usa `getSafeZone()`
   para posicionar y `<SafeZoneGuide>` (prop `showSafeZones`) para revisar.
9. **Control de calidad antes de entregar** (siempre, sin excepción):
   1. `npx tsc --noEmit && npx eslint src`
   2. Renderizar: `npx remotion render <Id> out/<Id>.mp4`
   3. Verificar el archivo: `ffprobe -v error -show_entries stream=width,height,r_frame_rate,nb_frames -of csv=p=0 out/<Id>.mp4`
   4. Extraer frames clave (inicio de cada entrada, momento de máximo
      contenido, salida y último frame):
      `ffmpeg -y -ss <seg> -i out/<Id>.mp4 -frames:v 1 out/frames/<Id>-<seg>.png`
      o una hoja de contacto:
      `ffmpeg -y -i out/<Id>.mp4 -vf "fps=2,scale=270:-1,tile=6x2" -frames:v 1 out/frames/<Id>-sheet.png`
   5. Revisar las imágenes: texto cortado o fuera de cuadro, invasión de
      zonas seguras, saltos de timing, cortes bruscos, frames vacíos,
      fuentes no cargadas (fallback serif = error).
   6. Corregir y repetir hasta que esté limpio. Informar qué se revisó.

## Comandos

- Studio: `npm run dev` (http://localhost:3000)
- Render: `npx remotion render <Id> out/<Id>.mp4` (o `npm run render:test`)
- Still: `npx remotion still <Id> out/<Id>.png --frame=<n>`
- Composiciones: `npx remotion compositions`
- Si no se puede descargar Chrome Headless Shell, define
  `REMOTION_BROWSER_EXECUTABLE=/ruta/a/chrome` (lo lee `remotion.config.ts`).
