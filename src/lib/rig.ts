/**
 * Mutable "rig" values that drive device animation (exploded view, strap separation, etc).
 * The director writes targets; devices read the damped values every frame. No React state involved.
 */
export const rig = {
  explode: 0,
  strap: 0,
  screenOn: 1,
  watchOn: 1,
  zoom: 0,
  budsOut: 0,
  caseOpen: 0,
  /** audio-reactive 0..1 level */
  pulse: 0,
  /** 0..1 hero intro (emergence from darkness) */
  intro: 0,
  time: 0,
  /** per-section visual weights (0..1), written by the director */
  w: [0, 0, 0, 0, 0, 0, 0, 0, 0] as number[],
}

/** Set when the visitor has taken manual control of a scroll-driven sequence. */
export const flags = { watchTouched: false, audioTouched: false, ecoPan: 0 }

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt))
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3)
