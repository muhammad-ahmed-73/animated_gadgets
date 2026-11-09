import type Lenis from 'lenis'
import { SECTIONS } from '../data/products'

/**
 * Shared, mutable scroll model — read every frame by the 3D director and by DOM-side
 * effects without ever touching React state.
 *
 *   index : section currently "owning" the viewport
 *   p     : 0..1 progress through that section's sticky span
 *   k     : 0..1 eased blend toward the next section (the final viewport-height of a section)
 */
export const scrollModel = {
  y: 0,
  vel: 0,
  index: 0,
  p: 0,
  k: 0,
  tops: [] as number[],
  heights: [] as number[],
  vh: 800,
}

export function measureSections() {
  scrollModel.vh = window.innerHeight
  scrollModel.tops = SECTIONS.map((s) => {
    const el = document.getElementById('s-' + s.id)
    return el ? el.getBoundingClientRect().top + window.scrollY : 0
  })
  scrollModel.heights = SECTIONS.map((s) => {
    const el = document.getElementById('s-' + s.id)
    return el ? el.offsetHeight : 0
  })
}

const smooth = (t: number) => t * t * (3 - 2 * t)

let lastY = 0
export function updateScroll(y: number) {
  const m = scrollModel
  m.vel += ((y - lastY) / Math.max(1, m.vh) - m.vel) * 0.2
  lastY = y
  m.y = y
  const n = m.tops.length
  if (!n) return
  let i = 0
  for (let j = 0; j < n; j++) if (y >= m.tops[j] - 1) i = j
  const h = m.heights[i] || m.vh * 2
  const span = Math.max(1, h - m.vh)
  m.index = i
  m.p = Math.min(1, Math.max(0, (y - m.tops[i]) / span))
  const trans = (y - (m.tops[i] + h - m.vh)) / m.vh
  m.k = i < n - 1 ? smooth(Math.min(1, Math.max(0, trans))) : 0
}

/** Section-local progress (0..1 of the sticky span) → absolute scroll position. */
export function sectionScrollTarget(index: number, p: number) {
  const m = scrollModel
  const h = m.heights[index] || m.vh * 2
  return m.tops[index] + p * Math.max(1, h - m.vh)
}

export const lenisRef: { current: Lenis | null } = { current: null }

export function scrollToSection(index: number, p = 0, duration = 2) {
  const y = sectionScrollTarget(index, p)
  if (lenisRef.current) lenisRef.current.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}
