# Motion Studio

Entorno de motion graphics con Remotion 4.0.530 + TypeScript + Tailwind v4.
Reglas de animación y flujo de control de calidad en [CLAUDE.md](./CLAUDE.md).

```bash
npm i                # instalar
npm run dev          # Remotion Studio → http://localhost:3000
npm run render:test  # render de prueba → out/TestReel-9x16.mp4
npx remotion render <Id> out/<Id>.mp4
npm run check        # tsc + eslint
```

- Marca (colores, tipografías, logo): `src/brand/brand.ts`
- Componentes: `src/components/` — KineticText, LowerThird, LogoReveal, Counter,
  Transition (TRANSITIONS / PanelWipe), AnimatedGradient, MotionBlur, SafeZoneGuide
- Tiempos y curvas: `src/lib/`
- Composiciones: `src/compositions/` (Base-9x16, Base-1x1, Base-16x9, TestReel-9x16)
