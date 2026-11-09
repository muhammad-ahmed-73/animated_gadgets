import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { S } from '../data/products'
import { scrollToSection } from '../lib/scroll'
import { Lines } from '../ui/Lines'
import { Arrow, MagneticButton } from '../ui/MagneticButton'
import { Section } from './common'

export function Hero() {
  const introDone = useStore((s) => s.introDone)
  return (
    <Section index={S.awakening} className="hero">
      <div className="hero__top mono" style={{ color: 'var(--muted)' }}>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: introDone ? 1 : 0 }} transition={{ delay: 1.2, duration: 1.2 }}>
          NOVA / Concept 2026
        </motion.span>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: introDone ? 1 : 0 }} transition={{ delay: 1.4, duration: 1.2 }}>
          N1 — Flagship Series
        </motion.span>
      </div>

      <div className="hero__foot">
        <h1 className="hero__head h-xl">
          <Lines as="span" mode="intro" lines={['TECHNOLOGY', 'BEYOND', 'IMAGINATION.']} lineClass={['', 'outline', 'grad']} stagger={0.035} delay={0.25} />
        </h1>
        <div className="hero__cta">
          <motion.p
            className="lead"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: introDone ? 1 : 0, y: introDone ? 0 : 24 }}
            transition={{ delay: 1.0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Discover a new dimension of connected experiences.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: introDone ? 1 : 0, y: introDone ? 0 : 24 }}
            transition={{ delay: 1.25, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <MagneticButton onClick={() => scrollToSection(S.engineering, 0, 2.6)}>
              Enter the NOVA experience <Arrow />
            </MagneticButton>
          </motion.div>
        </div>
      </div>
      <div className="scroll-cue mono" aria-hidden="true">
        Scroll
        <i />
      </div>
    </Section>
  )
}
