import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useStore } from './store/useStore'
import { lenisRef, measureSections, scrollModel, updateScroll } from './lib/scroll'
import { bindPointer } from './lib/pointer'
import { Cursor } from './ui/Cursor'
import { Loader } from './ui/Loader'
import { Nav } from './ui/Nav'
import { Hero } from './sections/Hero'
import { Engineering } from './sections/Engineering'
import { Ecosystem } from './sections/Ecosystem'
import { PhoneSection } from './sections/PhoneSection'
import { WatchSection } from './sections/WatchSection'
import { AudioSection } from './sections/AudioSection'
import { LabSection } from './sections/LabSection'
import { ConnectedSection } from './sections/ConnectedSection'
import { Finale } from './sections/Finale'

gsap.registerPlugin(ScrollTrigger)
const Experience = lazy(() => import('./three/Experience').then((m) => ({ default: m.Experience })))

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err: unknown) {
    console.error('[NOVA] WebGL scene failed', err)
    useStore.getState().set({ webgl: false, ready: true })
  }
  render() { return this.state.failed ? <div className="fallback" aria-hidden="true" /> : this.props.children }
}

export default function App() {
  const webgl = useStore((s) => s.webgl)

  useEffect(() => bindPointer(), [])

  // smooth scrolling + section measurement
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const reduced = useStore.getState().reduced
    let lenis: Lenis | null = null
    let tick: ((t: number) => void) | null = null
    if (!reduced) {
      lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.4 })
      lenisRef.current = lenis
      lenis.on('scroll', ScrollTrigger.update)
      tick = (t) => lenis!.raf(t * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      lenis.stop() // locked until the loader finishes
    }
    const unsubIntro = useStore.subscribe((s, p) => {
      if (s.introDone && !p.introDone) lenis?.start()
    })
    if (reduced) document.documentElement.style.overflow = ''

    const remeasure = () => { measureSections(); updateScroll(window.scrollY); ScrollTrigger.refresh() }
    const ro = new ResizeObserver(() => { measureSections(); updateScroll(window.scrollY) })
    ro.observe(document.body)
    window.addEventListener('resize', remeasure)
    void document.fonts.ready.then(remeasure)
    const t = window.setTimeout(remeasure, 600)

    // block native scroll during the loader when Lenis is not in charge
    const lock = (e: Event) => { if (!useStore.getState().introDone) e.preventDefault() }
    window.addEventListener('wheel', lock, { passive: false })
    window.addEventListener('touchmove', lock, { passive: false })

    const keys = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const st = useStore.getState()
      if (st.menuOpen) return
      if (st.focus) st.set({ focus: null })
      if (st.connSel) st.set({ connSel: null })
      if (st.phoneHotspot) st.set({ phoneHotspot: null })
      if (st.watchHotspot) st.set({ watchHotspot: null })
    }
    window.addEventListener('keydown', keys)

    return () => {
      unsubIntro()
      window.clearTimeout(t)
      ro.disconnect()
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('wheel', lock)
      window.removeEventListener('touchmove', lock)
      window.removeEventListener('keydown', keys)
      if (tick) gsap.ticker.remove(tick)
      lenis?.destroy()
      lenisRef.current = null
      scrollModel.tops = []
    }
  }, [])

  // lock page scroll via the loader overlay also for keyboard users
  useEffect(() => {
    const el = document.documentElement
    const unsub = useStore.subscribe((s) => { el.style.overflow = s.introDone ? '' : 'hidden' })
    el.style.overflow = 'hidden'
    return () => { unsub(); el.style.overflow = '' }
  }, [])

  return (
    <>
      <a className="skip" href="#s-engineering">Skip to content</a>
      <div className="stage" role="img" aria-label="Interactive 3D scene of NOVA devices">
        {webgl ? (
          <SceneBoundary>
            <Suspense fallback={<div className="fallback" />}>
              <Experience />
            </Suspense>
          </SceneBoundary>
        ) : (
          <div className="fallback" />
        )}
      </div>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Engineering />
        <Ecosystem />
        <PhoneSection />
        <WatchSection />
        <AudioSection />
        <LabSection />
        <ConnectedSection />
        <Finale />
      </main>
      <Loader />
    </>
  )
}
