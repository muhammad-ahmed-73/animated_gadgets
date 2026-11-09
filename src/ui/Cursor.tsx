import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useStore } from '../store/useStore'
import { pointer } from '../lib/pointer'

/** Custom cursor: a dot plus a lagging ring that grows over links and shows contextual labels over 3D objects. */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (pointer.coarse) return
    document.body.classList.add('is-fine')
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' })
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'none' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'none' })
    const el = root.current!
    el.classList.add('is-hidden')

    const move = (e: PointerEvent) => {
      el.classList.remove('is-hidden')
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY)
      const t = (e.target as HTMLElement | null)?.closest?.('[data-cursor], a, button, input')
      el.classList.toggle('is-link', !!t)
    }
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')
    const leave = () => el.classList.add('is-hidden')
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)

    const unsub = useStore.subscribe((s, prev) => {
      if (s.cursorLabel !== prev.cursorLabel) {
        if (label.current) label.current.textContent = s.cursorLabel ?? ''
        el.classList.toggle('is-label', !!s.cursorLabel)
      }
    })
    return () => {
      document.body.classList.remove('is-fine')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
      unsub()
    }
  }, [])

  return (
    <div ref={root} className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring"><span ref={label} className="cursor__label" /></div>
      <div ref={dot} className="cursor__dot" />
    </div>
  )
}
