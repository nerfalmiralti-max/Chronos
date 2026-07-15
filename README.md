# KRONOS

KRONOS is a cinematic, public web experience that treats time as physical material. Days become nodes, weeks become structures, months become constellations, and completed work becomes light.

## Technology

- Next.js App Router and TypeScript
- Tailwind CSS 4
- Three.js, React Three Fiber, Drei, and Postprocessing
- Custom GLSL atmosphere, particle, and filament shaders
- GSAP for scroll direction, Lenis for desktop smoothing
- Framer Motion for interface motion and Motion One for isolated completion signals

## Worlds

- `/` — Temporal Genesis
- `/today` — Now Field
- `/goals` — Long Arc
- `/calendar` — Time Orbit
- `/analytics` — Memory Field
- `/timer` — Temporal Chamber

Every route is public. Tasks, goal progress, and focus memory are stored only in the current browser profile. The project has no account system, backend requirement, identity record, or environment variables.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The experience provides a non-WebGL fallback, respects `prefers-reduced-motion` and Save-Data before loading the heavy scene, adapts quality to GPU performance, disables desktop-only smoothing on touch devices, and pauses rendering when the page is hidden.

The production build also exposes a standalone web manifest, maskable and Apple touch icons, plus a versioned offline shell service worker.
