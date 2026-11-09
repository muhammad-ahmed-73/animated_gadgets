/** Normalised pointer position (-1..1) shared by the cursor, camera parallax and device tilt. */
export const pointer = { x: 0, y: 0, px: -100, py: -100, coarse: false }

export function bindPointer() {
  pointer.coarse = window.matchMedia('(pointer: coarse)').matches
  const move = (e: PointerEvent) => {
    pointer.px = e.clientX
    pointer.py = e.clientY
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }
  window.addEventListener('pointermove', move, { passive: true })
  return () => window.removeEventListener('pointermove', move)
}
