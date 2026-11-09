import { useLayoutEffect, useRef, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useStore } from '../store/useStore'

gsap.registerPlugin(ScrollTrigger)

interface LinesProps {
  lines: string[]
  as?: ElementType
  className?: string
  /** per-line class names, e.g. outline / grad */
  lineClass?: (string | undefined)[]
  stagger?: number
  delay?: number
  /** 'scroll' reveals when scrolled into view, 'intro' waits for the loading sequence */
  mode?: 'scroll' | 'intro'
  start?: string
}

/** Masked, per-character staggered headline reveal with explicit line breaks. */
export function Lines({ lines, as: Tag = 'h2', className = '', lineClass = [], stagger = 0.022, delay = 0, mode = 'scroll', start = 'top 88%' }: LinesProps) {
  const ref = useRef<HTMLElement>(null)
  const introDone = useStore((s) => s.introDone)
  const reduced = useStore((s) => s.reduced)
  const tl = useRef<gsap.core.Tween | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const chars = el.querySelectorAll('.ch')
    if (reduced) { gsap.set(chars, { yPercent: 0 }); return }
    gsap.set(chars, { yPercent: 118, rotate: 5 })
    const vars: gsap.TweenVars = { yPercent: 0, rotate: 0, duration: 1.25, ease: 'expo.out', stagger, delay, paused: mode === 'intro' }
    if (mode === 'scroll') vars.scrollTrigger = { trigger: el, start, toggleActions: 'play none none reverse' }
    tl.current = gsap.to(chars, vars)
    return () => { tl.current?.scrollTrigger?.kill(); tl.current?.kill() }
  }, [reduced, stagger, delay, mode, start, lines])

  useLayoutEffect(() => {
    if (mode === 'intro' && introDone && !reduced) tl.current?.play()
  }, [introDone, mode, reduced])

  return (
    <Tag ref={ref} className={className} aria-label={lines.join(' ')}>
      {lines.map((line, i) => (
        <span className={'ln ' + (lineClass[i] ?? '')} key={i} aria-hidden="true">
          {line.split(' ').map((w, wi, arr) => (
            <span className="wd" key={wi}>
              {Array.from(w).map((c, ci) => (
                <span className="ch" key={ci}>{c}</span>
              ))}
              {wi < arr.length - 1 ? ' ' : ''}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}
