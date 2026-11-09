# NOVA — Assets & Licensing

**NOVA is a fictional brand; this is a non-commercial concept project.**

## 3D models
There are **no external 3D assets** in this project. Blender and model-download access were not
available, so every product is an **original, procedurally modelled** object built in code from
Three.js geometry (extruded/bevelled rounded rectangles, lathes, tori, bent strips):

| Product | File | Separate meshes |
|---|---|---|
| NOVA Phone | `src/three/devices/Phone.tsx` | screen, frame, logic board + chips, battery, back glass, camera module (3 lenses) |
| NOVA Watch | `src/three/devices/Watch.tsx` | case, glass, display, crown, sensor, upper/lower strap |
| NOVA Buds | `src/three/devices/Buds.tsx` | case, hinged lid, 2 buds |
| NOVA Headphones | `src/three/devices/Headphones.tsx` | band, yokes, 2 cups with cushions |
| NOVA Pod | `src/three/devices/Pod.tsx` | base, fabric body, glass cap, light ring |

Limitation: these are conceptual models, not Blender-authored GLBs. `public/models/` is reserved for
GLB replacements; the device components are the only place that would need swapping.

## Textures
All textures (phone wallpapers, PCB, battery label, speaker fabric, watch faces) are drawn at runtime
on `<canvas>` in `src/three/textures.ts`. No image files.

## Lighting / environment
Reflections come from a procedural `Lightformer` environment — no HDRI downloads.

## Fonts
- Sora (variable) — `@fontsource-variable/sora`, SIL Open Font License 1.1
- JetBrains Mono (variable) — `@fontsource-variable/jetbrains-mono`, SIL Open Font License 1.1

## Audio
Optional ambient sound is synthesised with the Web Audio API (`src/lib/audio.ts`). No audio files; nothing plays until the visitor enables it.

## Libraries
three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, GSAP (+ScrollTrigger),
Framer Motion, Lenis, zustand — all used under their respective licences. Theatre.js is not used.
