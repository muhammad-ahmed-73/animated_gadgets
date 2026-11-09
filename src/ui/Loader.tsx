import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStore } from '../store/useStore'
import { rig } from '../lib/rig'
import { sound } from '../lib/audio'
import { NovaLogo } from './NovaLogo'

const STATUS = ['Calibrating optics', 'Compiling shaders', 'Aligning sensors', 'Igniting display', 'Ready']

/**
 * Cinematic boot sequence. Progress is the real minimum of: elapsed choreography, fonts loaded
 * and the WebGL scene having compiled + rendered its first frames.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLElement>(null)
  const count = useRef<HTMLElement>(null)
  const status = useRef<HTMLSpanElement>(null)
  const logoWrap = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)
  const [asking, setAsking] = useState(false)
  const exitRef = useRef<(() => void) | null>(null)
  const yesBtn = useRef<HTMLButtonElement>(null)

  // The click is the user gesture browsers require before audio may start.
  const choose = (withSound: boolean) => {
    if (!exitRef.current) return
    if (withSound) {
      void sound.start()
      useStore.getState().set({ soundOn: true })
    }
    const go = exitRef.current
    exitRef.current = null
    setAsking(false)
    go()
  }

  useEffect(() => {
    if (!asking) return
    const el = root.current?.querySelector('.loader__ask')
    if (el) gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' })
    yesBtn.current?.focus()
  }, [asking])
  const reduced = useStore((s) => s.reduced)

  useEffect(() => {
    const st = useStore.getState()
    const root_ = root.current!
    const paths = logoWrap.current!.querySelectorAll<SVGGraphicsElement>('polyline, circle:not(.lg-dot)')
    const dot = logoWrap.current!.querySelector('.lg-dot')
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(dot, { opacity: 0, scale: 0, transformOrigin: 'center' })
    const intro = gsap.timeline()
    intro
      .to(paths, { strokeDashoffset: 0, duration: reduced ? 0.2 : 1.6, ease: 'power3.inOut', stagger: 0.14 })
      .to(dot, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(3)' }, '-=0.5')

    const t0 = performance.now()
    let fonts = false
    void document.fonts.ready.then(() => { fonts = true })
    const minMs = reduced ? 600 : 2900
    let shown = 0
    let finished = false

    const tick = () => {
      const time = Math.min(1, (performance.now() - t0) / minMs)
      const gate = (fonts ? 0.35 : 0.1) + (useStore.getState().ready ? 0.65 : 0.0)
      const target = Math.min(time, gate + (st.webgl ? 0 : 1))
      shown += (target - shown) * 0.12
      if (target >= 1 && shown > 0.995) shown = 1
      const pct = Math.round(shown * 100)
      if (count.current) count.current.textContent = String(pct).padStart(3, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${shown})`
      if (status.current) status.current.textContent = STATUS[Math.min(STATUS.length - 1, Math.floor(shown * STATUS.length))]
      if (shown >= 1 && !finished) {
        finished = true
        gsap.ticker.remove(tick)
        exitRef.current = exit
        setAsking(true)
      }
    }

    const exit = () => {
      const tl = gsap.timeline({ onComplete: () => setGone(true) })
      tl.to({}, { duration: 0.5 })
        .to(root_.querySelector('.loader__core'), { opacity: 0, y: -20, duration: 0.6, ease: 'power2.in' })
        .to(root_.querySelector('.loader__half--t'), { yPercent: -101, duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
        .to(root_.querySelector('.loader__half--b'), { yPercent: 101, duration: 1.1, ease: 'expo.inOut' }, '<')
        .add(() => {
          useStore.getState().set({ introDone: true })
          // the phone emerges from darkness
          gsap.to(rig, { intro: 1, duration: reduced ? 0.4 : 4.2, ease: 'power2.inOut', delay: 0.15 })
        }, '-=0.7')
    }
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); intro.kill() }
  }, [reduced])

  if (gone) return null
  return (
    <div ref={root} className="loader" role="status" aria-live="polite" aria-label="Loading NOVA">
      <div className="loader__half loader__half--t" />
      <div className="loader__half loader__half--b" />
      <div className="loader__core">
        <div ref={logoWrap}><NovaLogo className="loader__logo" draw /></div>
        <div className="loader__meta mono" style={{ display: asking ? 'none' : undefined }}>
          <div className="loader__bar"><i ref={bar as React.RefObject<HTMLElement>} /></div>
          <div className="loader__row">
            <span ref={status}>{STATUS[0]}</span>
            <b ref={count as React.RefObject<HTMLElement>}>000</b>
          </div>
        </div>
        {asking && (
          <div className="loader__ask" role="dialog" aria-label="Enter with sound?">
            <p className="mono">Enter with sound?</p>
            <p className="loader__sub">Headphones recommended. Sound is optional and can be changed anytime from the top bar.</p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button ref={yesBtn} type="button" className="btn" data-cursor="link" onClick={() => choose(true)}>
                <span className="btn__in">Yes</span>
              </button>
              <button type="button" className="btn" data-cursor="link" onClick={() => choose(false)}>
                <span className="btn__in">No</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
