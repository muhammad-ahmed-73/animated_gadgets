import { Hud } from './common'
import { AnimatePresence, motion } from 'framer-motion'
import { FINISHES, S } from '../data/products'
import { useStore, } from '../store/useStore'
import { scrollToSection } from '../lib/scroll'
import { Lines } from '../ui/Lines'
import { SCREEN_NAMES } from '../three/textures'
import { PHONE_HOTSPOTS } from '../three/devices/Phone'
import { Chip, DragHint, Eyebrow, Section, Swatches } from './common'

const SHOTS: [string, number][] = [['Front', 0.17], ['Rear', 0.45], ['Lens', 0.58], ['Full', 0.99]]

export function PhoneSection() {
  const c = useStore((s) => s.custom.phone)
  const setCustom = useStore((s) => s.setCustom)
  const explode = useStore((s) => s.phoneExplode)
  const screen = useStore((s) => s.phoneScreen)
  const hot = useStore((s) => s.phoneHotspot)
  const set = useStore((s) => s.set)
  const hotspot = PHONE_HOTSPOTS.find((h) => h.id === hot)

  return (
    <Section index={S.phone} className="stack">
      <div className="col">
        <Eyebrow index={S.phone}>The smartphone experience</Eyebrow>
        <h2 className="h-lg">
          <Lines as="span" lines={['A NEW', 'PERSPECTIVE.']} lineClass={['', 'grad']} />
        </h2>
        <p className="lead">Follow the camera from display to lens, or take control: rotate, recolour and disassemble it yourself.</p>
        <div className="row ui" role="group" aria-label="Camera sequence">
          <span className="mono" style={{ color: 'var(--muted)', marginRight: '0.4rem' }}>Camera</span>
          {SHOTS.map(([n, p]) => (
            <Chip key={n} onClick={() => { set({ phoneExplode: false }); scrollToSection(S.phone, p, 2.2) }}>{n}</Chip>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {hotspot && (
            <motion.div key={hotspot.id} className="info ui" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="mono" style={{ color: 'var(--cyan)' }}>{hotspot.label}</span>
              <h4>{hotspot.title}</h4>
              <p>{hotspot.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="right-col controls ui">
        <Hud title="Configure">
          <div className="field"><div className="mono">Frame <em>{c.primary === '#c5cbd3' ? 'Titanium' : ''}</em></div>
            <Swatches label="Frame colour" value={c.primary} onChange={(hex) => setCustom('phone', { primary: hex })} /></div>
          <div className="field"><div className="mono">Back glass</div>
            <Swatches label="Back glass colour" value={c.secondary} onChange={(hex) => setCustom('phone', { secondary: hex })} /></div>
          <div className="field"><div className="mono">Frame finish</div>
            <div className="row">{FINISHES.map((f) => <Chip key={f} on={c.finish === f} onClick={() => setCustom('phone', { finish: f })}>{f}</Chip>)}</div></div>
          <div className="field"><div className="mono">Display</div>
            <div className="row">{SCREEN_NAMES.map((n, i) => <Chip key={n} on={screen === i} onClick={() => set({ phoneScreen: i })}>{n}</Chip>)}</div></div>
          <div className="field"><div className="mono">Inside</div>
            <Chip on={explode} onClick={() => set({ phoneExplode: !explode, phoneHotspot: null })}>{explode ? 'Reassemble' : 'Exploded view'}</Chip></div>
        </Hud>
      </div>
      <div className="left-col"><DragHint label="Drag the phone · tap the markers" /></div>
    </Section>
  )
}
