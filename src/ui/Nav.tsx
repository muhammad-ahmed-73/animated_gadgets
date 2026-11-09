import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SECTIONS } from '../data/products'
import { useStore } from '../store/useStore'
import { scrollToSection } from '../lib/scroll'
import { sound } from '../lib/audio'
import { NovaLogo } from './NovaLogo'

export function toggleSound() {
  const st = useStore.getState()
  if (st.soundOn) { sound.stop(); st.set({ soundOn: false }) }
  else { void sound.start(); st.set({ soundOn: true }) }
}

export function Nav() {
  const active = useStore((s) => s.activeSection)
  const menuOpen = useStore((s) => s.menuOpen)
  const soundOn = useStore((s) => s.soundOn)
  const set = useStore((s) => s.set)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const sec = SECTIONS[active]

  useEffect(() => {
    if (!menuOpen) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { set({ menuOpen: false }); menuBtn.current?.focus() } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [menuOpen, set])

  const go = (i: number) => {
    set({ menuOpen: false })
    sound.blip(520)
    window.setTimeout(() => scrollToSection(i, 0, i === 0 ? 1.4 : 2.4), menuOpen ? 350 : 0)
  }

  return (
    <>
      <header className="nav">
        <a href="#s-awakening" className="nav__logo" aria-label="NOVA — home" data-cursor="link" onClick={(e) => { e.preventDefault(); go(0) }}>
          <NovaLogo />
        </a>
        <div className="nav__label mono" aria-hidden="true">
          <b>{sec.index}</b>
          <span>{sec.label}</span>
        </div>
        <div className="nav__actions">
          <button type="button" className={'pill' + (soundOn ? ' is-on' : '')} data-cursor="link" aria-pressed={soundOn} onClick={toggleSound}>
            <span className="eq" aria-hidden="true"><i /><i /><i /></span>
            Sound {soundOn ? 'on' : 'off'}
          </button>
          <button ref={menuBtn} type="button" className="pill" data-cursor="link" aria-expanded={menuOpen} aria-controls="menu" onClick={() => set({ menuOpen: !menuOpen })}>
            {menuOpen ? 'Close' : 'Index'}
          </button>
        </div>
      </header>

      <nav className="rail" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <button key={s.id} type="button" className={i === active ? 'is-on' : ''} aria-label={s.label} aria-current={i === active} data-cursor="link" onClick={() => go(i)}>
            <span>{s.index}</span>
            <i />
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="menu"
            className="menu"
            role="dialog"
            aria-label="Site index"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(100% 0 0 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ol>
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.8, delay: 0.25 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}>
                    <button type="button" className={i === active ? 'is-on' : ''} data-cursor="link" onClick={() => go(i)}>
                      <em>{s.index}</em>
                      {s.label}
                    </button>
                  </motion.div>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
