import { AnimatePresence, motion } from 'framer-motion'
import { PRODUCTS, PRODUCT_IDS, S, type ProductId } from '../data/products'
import { useStore } from '../store/useStore'
import { sound } from '../lib/audio'
import { Lines } from '../ui/Lines'
import { Arrow, MagneticButton } from '../ui/MagneticButton'
import { DragHint, Eyebrow, Section } from './common'

export function Ecosystem() {
  const focus = useStore((s) => s.focus)
  const hovered = useStore((s) => s.hovered)
  const set = useStore((s) => s.set)
  const info = focus ? PRODUCTS[focus] : null

  const select = (id: ProductId | null) => { sound.blip(600); set({ focus: id }) }
  const step = (d: number) => {
    if (!focus) return
    const i = (PRODUCT_IDS.indexOf(focus) + d + PRODUCT_IDS.length) % PRODUCT_IDS.length
    select(PRODUCT_IDS[i])
  }

  return (
    <Section index={S.ecosystem} className="stack">
      <div className="col" style={{ opacity: focus ? 0.0 : 1, transition: 'opacity .6s', pointerEvents: focus ? 'none' : undefined }}>
        <Eyebrow index={S.ecosystem}>The NOVA ecosystem</Eyebrow>
        <h2 className="h-lg" style={{ fontSize: 'clamp(2rem, 4.8vw, 5.2rem)' }}>
          <Lines as="span" lines={['ONE WORLD.', 'INFINITE', 'POSSIBILITIES.']} lineClass={['', '', 'grad']} />
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {info && (
          <motion.div
            key={info.id}
            className="detail ui"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow mono"><b>{String(PRODUCT_IDS.indexOf(info.id) + 1).padStart(2, '0')}</b>{info.kicker}</p>
            <h3 className="h-md">
              {info.headline.map((l, i) => (
                <span className="ln" key={l}>
                  <motion.span style={{ display: 'block' }} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}>{l}</motion.span>
                </span>
              ))}
            </h3>
            <p className="lead" style={{ fontSize: '0.92rem' }}>{info.desc}</p>
            <dl className="detail__specs mono" style={{ margin: 0 }}>
              {info.specs.map(([k, v], i) => (
                <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}>
                  <dt>{k}</dt><dd>{v}</dd>
                </motion.div>
              ))}
            </dl>
            <div className="row">
              <MagneticButton className="btn--sm" onClick={() => select(null)}>Showroom</MagneticButton>
              <button type="button" className="chip" data-cursor="link" onClick={() => step(-1)} aria-label="Previous product">←</button>
              <button type="button" className="chip" data-cursor="link" onClick={() => step(1)} aria-label="Next product">→</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="col push-bottom" style={{ gap: '1rem', width: '100%' }}>
        {!focus && <DragHint label="Click a device to inspect" />}
        <ul className="eco-list mono ui" aria-label="Products">
          {PRODUCT_IDS.map((id, i) => (
            <li key={id} style={{ flex: 1, display: 'flex' }}>
              <button type="button" className={focus === id || (!focus && hovered === id) ? 'is-on' : ''} data-cursor="link" onClick={() => select(focus === id ? null : id)}
                onPointerEnter={() => !focus && set({ hovered: id })} onPointerLeave={() => set({ hovered: null })}>
                <em>{String(i + 1).padStart(2, '0')}</em>
                <span>{PRODUCTS[id].name.replace('NOVA ', '')}</span>
              </button>
            </li>
          ))}
        </ul>
        {focus && <span className="hint mono"><Arrow /> Drag to rotate · Esc to leave</span>}
      </div>
    </Section>
  )
}
