import { AnimatePresence, motion } from 'framer-motion'
import { LINKS, PRODUCTS, PRODUCT_IDS, S } from '../data/products'
import { useStore } from '../store/useStore'
import { Lines } from '../ui/Lines'
import { Chip, DragHint, Eyebrow, Section } from './common'

export function ConnectedSection() {
  const sel = useStore((s) => s.connSel)
  const set = useStore((s) => s.set)
  const links = sel ? LINKS.filter(([a, b]) => a === sel || b === sel) : []

  return (
    <Section index={S.connected} className="stack">
      <div className="col">
        <Eyebrow index={S.connected}>The future is connected</Eyebrow>
        <h2 className="h-lg">
          <Lines as="span" lines={['A MORE', 'CONNECTED', 'TOMORROW.']} lineClass={['', '', 'grad']} />
        </h2>
        <p className="lead">Select any device to light up everything it talks to.</p>
        <div className="row ui" role="group" aria-label="Select a device">
          {PRODUCT_IDS.map((id) => (
            <Chip key={id} on={sel === id} onClick={() => set({ connSel: sel === id ? null : id })}>{PRODUCTS[id].name.replace('NOVA ', '')}</Chip>
          ))}
        </div>
      </div>

      <div className="right-col ui" style={{ width: 'min(22rem, 100%)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={sel ?? 'none'} className="hud" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
            <h4 className="mono">{sel ? `${PRODUCTS[sel].name} ↔ ${links.length} devices` : 'Network idle'}</h4>
            {sel ? (
              <ul className="steps mono" style={{ gap: '0.7rem' }}>
                {links.map(([a, b, label]) => {
                  const other = a === sel ? b : a
                  return (
                    <li key={a + b} className="is-on" style={{ justifyContent: 'space-between', transform: 'none' }}>
                      <span>{PRODUCTS[other].name.replace('NOVA ', '')}</span>
                      <em>{label}</em>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>Eight live links. Click a floating device — or a name on the left — to follow its connections.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="left-col"><DragHint label="Click a device to trace its links" /></div>
    </Section>
  )
}
