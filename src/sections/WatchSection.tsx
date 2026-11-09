import { Hud } from './common'
import { AnimatePresence, motion } from 'framer-motion'
import { FINISHES, S } from '../data/products'
import { useStore } from '../store/useStore'
import { flags } from '../lib/rig'
import { Lines } from '../ui/Lines'
import { FACE_NAMES } from '../three/textures'
import { WATCH_HOTSPOTS } from '../three/devices/Watch'
import { Chip, DragHint, Eyebrow, Section, Swatches } from './common'

export function WatchSection() {
  const c = useStore((s) => s.custom.watch)
  const setCustom = useStore((s) => s.setCustom)
  const face = useStore((s) => s.watchFace)
  const strapOff = useStore((s) => s.strapOff)
  const zoom = useStore((s) => s.watchZoom)
  const hot = useStore((s) => s.watchHotspot)
  const set = useStore((s) => s.set)
  const hotspot = WATCH_HOTSPOTS.find((h) => h.id === hot)

  return (
    <Section index={S.watch} className="stack">
      <div className="col">
        <Eyebrow index={S.watch}>Time, redefined</Eyebrow>
        <h2 className="h-lg">
          <Lines as="span" lines={['TIME MOVES', 'DIFFERENTLY.']} lineClass={['', 'grad']} />
        </h2>
        <p className="lead">A display that wakes with a glance. Scroll to watch it come alive — or choose your own face.</p>
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
        <Hud title="Customise">
          <div className="field"><div className="mono">Watch face <em>{FACE_NAMES[face]}</em></div>
            <div className="row">{FACE_NAMES.map((n, i) => (
              <Chip key={n} on={face === i} onClick={() => { flags.watchTouched = true; set({ watchFace: i }) }}>{n}</Chip>
            ))}</div></div>
          <div className="field"><div className="mono">Case</div>
            <Swatches label="Case colour" value={c.primary} onChange={(hex) => setCustom('watch', { primary: hex })} /></div>
          <div className="field"><div className="mono">Strap</div>
            <Swatches label="Strap colour" value={c.secondary} onChange={(hex) => setCustom('watch', { secondary: hex })} /></div>
          <div className="field"><div className="mono">Finish</div>
            <div className="row">{FINISHES.map((f) => <Chip key={f} on={c.finish === f} onClick={() => setCustom('watch', { finish: f })}>{f}</Chip>)}</div></div>
          <div className="field"><div className="mono">Inspect</div>
            <div className="row">
              <Chip on={strapOff} onClick={() => { flags.watchTouched = true; set({ strapOff: !strapOff }) }}>{strapOff ? 'Attach strap' : 'Release strap'}</Chip>
              <Chip on={zoom} onClick={() => { flags.watchTouched = true; set({ watchZoom: !zoom }) }}>{zoom ? 'Pull back' : 'Zoom to display'}</Chip>
            </div></div>
        </Hud>
      </div>
      <div className="left-col"><DragHint label="Drag the watch · tap the markers" /></div>
    </Section>
  )
}
