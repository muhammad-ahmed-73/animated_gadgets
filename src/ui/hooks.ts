import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { scrollModel } from '../lib/scroll'
import { S } from '../data/products'

/** Calls fn every animation frame (via the shared GSAP ticker) without causing React renders. */
export function useTick(fn: () => void) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    const f = () => ref.current()
    gsap.ticker.add(f)
    return () => gsap.ticker.remove(f)
  }, [])
}

/** Local progress (0..1) of a section's sticky span, or 0 / 1 when before / after. */
export function sectionProgress(index: number) {
  const m = scrollModel
  if (m.index < index) return 0
  if (m.index > index) return 1
  return m.p
}

/** Returns which step (by thresholds) a section's progress is in. Only re-renders when the step changes. */
export function useSectionStep(index: number, thresholds: number[]) {
  const [step, setStep] = useState(-1)
  const last = useRef(-1)
  useTick(() => {
    const p = sectionProgress(index)
    let s = -1
    thresholds.forEach((t, i) => { if (p >= t) s = i })
    if (m_isActive(index) === false) s = -1
    if (s !== last.current) { last.current = s; setStep(s) }
  })
  return step
}

function m_isActive(index: number) {
  return scrollModel.index === index || (scrollModel.index === index - 1 && scrollModel.k > 0.3)
}

export const SECTION_INDEX = S
