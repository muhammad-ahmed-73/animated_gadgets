import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { sound } from '../lib/audio'

interface Props {
  children: ReactNode
  onClick?: () => void
  className?: string
  strength?: number
  label?: string
}

/** Button that is gently pulled towards the pointer; its label moves further for a parallax feel. */
export function MagneticButton({ children, onClick, className = '', strength = 0.35, label }: Props) {
  const btn = useRef<HTMLButtonElement>(null)
  const inner = useRef<HTMLSpanElement>(null)

  const move = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return
    const b = btn.current!.getBoundingClientRect()
    const x = e.clientX - (b.left + b.width / 2)
    const y = e.clientY - (b.top + b.height / 2)
    gsap.to(btn.current, { x: x * strength, y: y * strength, duration: 0.5, ease: 'power3.out' })
    gsap.to(inner.current, { x: x * strength * 0.5, y: y * strength * 0.5, duration: 0.5, ease: 'power3.out' })
  }
  const leave = () => {
    gsap.to([btn.current, inner.current], { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.4)' })
  }

  return (
    <button
      ref={btn}
      type="button"
      className={'btn ' + className}
      data-cursor="link"
      aria-label={label}
      onPointerMove={move}
      onPointerLeave={leave}
      onClick={() => { sound.blip(660); onClick?.() }}
    >
      <span ref={inner} className="btn__in">{children}</span>
    </button>
  )
}

export const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M4 12h15M13 5l7 7-7 7" />
  </svg>
)
