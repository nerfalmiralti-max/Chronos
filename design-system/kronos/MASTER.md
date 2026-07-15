# KRONOS Web — Design Source of Truth

## Temporal material

The signature is one continuous Temporal Filament. It enters as a particle, becomes the line connecting days, grows into week structures, folds into month constellations, and finally extends into a year horizon. Sections transform the same material; they must never feel like disconnected 3D demonstrations.

KRONOS is dark-only. Space is active material rather than an empty background. Typography is rare, monumental, and precisely placed. Interface glass is reserved for navigation, controls, and selected temporal objects. The page must never become a wall of translucent cards.

Scrolling moves an authored camera through scale, matter, focus, memory, and horizon. Native scrolling is always preserved. GSAP owns scroll choreography, R3F owns shader and scene physics, Framer Motion owns DOM transitions, and Lenis owns desktop smoothing. Two engines never animate the same property.

Mobile is a separate composition: a vertical filament, shorter camera path, bottom world rail, touch-sized objects, no custom cursor, reduced particle count, and only subtle bloom. Reduced-motion and WebGL fallback modes remain visually complete and preserve all semantic controls.

## Tokens

```css
--void: #020306;
--void-soft: #06080d;
--graphite: #0d1118;
--graphite-raised: #151b25;
--white: #f4f7fb;
--silver: #d5dbe4;
--secondary: #a8b0be;
--muted: #717a89;
--blue: #78afff;
--blue-hot: #b5d1ff;
--complete: #9be6bd;
```

Blue occupies less than 5% of a viewport and means active time, focus, or energy transfer. Use Instrument Sans Variable for display/body and IBM Plex Mono for coordinates and labels.

## Scale

- Hero: `clamp(3.4rem, 8.5vw, 9rem)`, line-height `0.87`, tracking `-0.066em`
- Section: `clamp(2.8rem, 5.6vw, 6rem)`, line-height `0.94`
- Lead: `clamp(1.08rem, 1.55vw, 1.48rem)`, line-height `1.5`
- Page gutter: `clamp(20px, 5vw, 80px)`
- Maximum stage: `1600px`
- Macro rhythm: `24 / 32 / 48 / 64 / 80 / 96 / 128 / 160 / 240`

## Performance and access

- One Canvas per route, one owner of the camera
- Desktop DPR ≤1.5 and particles ≤4,200
- Mobile DPR ≤1.2 and particles ≤900
- Canvas is decorative; meaningful text and actions stay in semantic DOM
- Visible focus rings, 44px minimum targets, no hover-only actions
- Pause on hidden tab; static fallback for reduced motion, Save-Data, and unavailable WebGL
- No image backgrounds, no generic dashboard grids, no authentication/profile UI
