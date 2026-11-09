import { Hud } from './common'
import { FINISHES, PRODUCTS, PRODUCT_IDS, S, SWATCHES } from '../data/products'
import { swatchName } from '../lib/swatch'
import { useStore } from '../store/useStore'
import { Lines } from '../ui/Lines'
import { Chip, DragHint, Eyebrow, Section, Swatches } from './common'

export function LabSection() {
  const id = useStore((s) => s.labProduct)
  const c = useStore((s) => s.custom[id])
  const zoom = useStore((s) => s.labZoom)
  const set = useStore((s) => s.set)
  const setCustom = useStore((s) => s.setCustom)
  const reset = useStore((s) => s.resetCustom)
  const secondaryLabel: Record<string, string> = { phone: 'Back glass', watch: 'Strap', buds: 'Silicone tips', headphones: 'Cushions', pod: 'Fabric' }

  return (
    <Section index={S.lab} className="stack">
      <div className="col">
        <Eyebrow index={S.lab}>The material lab</Eyebrow>
        <h2 className="h-lg">
          <Lines as="span" lines={['MAKE IT', 'YOURS.']} lineClass={['', 'grad']} />
        </h2>
        <div className="row ui" role="tablist" aria-label="Product">
          {PRODUCT_IDS.map((p) => (
            <Chip key={p} on={p === id} onClick={() => set({ labProduct: p })}>{PRODUCTS[p].name.replace('NOVA ', '')}</Chip>
          ))}
        </div>
        <p className="config mono">
          <span>{PRODUCTS[id].name}</span>
          <b>{swatchName(c.primary)}</b> / <b>{swatchName(c.secondary)}</b> · <b>{c.finish}</b>
        </p>
      </div>

      <div className="right-col controls ui">
        <Hud title={`Material lab · ${PRODUCTS[id].name}`}>
          <div className="field"><div className="mono">Primary <em>{swatchName(c.primary)}</em></div>
            <Swatches label="Primary colour" value={c.primary} onChange={(hex) => setCustom(id, { primary: hex })} /></div>
          <div className="field"><div className="mono">Secondary — {secondaryLabel[id]} <em>{swatchName(c.secondary)}</em></div>
            <Swatches label="Secondary colour" value={c.secondary} onChange={(hex) => setCustom(id, { secondary: hex })} /></div>
          <div className="field"><div className="mono">Finish</div>
            <div className="row">{FINISHES.map((f) => <Chip key={f} on={c.finish === f} onClick={() => setCustom(id, { finish: f })}>{f}</Chip>)}</div></div>
          <div className="field"><div className="mono">Zoom <em>{Math.round(zoom * 100)}%</em></div>
            <input className="range" type="range" min={0} max={1} step={0.01} value={zoom} aria-label="Zoom" data-cursor="link" onChange={(e) => set({ labZoom: Number(e.target.value) })} /></div>
          <div className="field"><button type="button" className="chip" data-cursor="link" onClick={() => reset(id)}>Reset customisation</button></div>
          <span className="sr-only">{SWATCHES.length} colours available</span>
        </Hud>
      </div>
      <div className="left-col"><DragHint label="Drag to rotate · slide to zoom" /></div>
    </Section>
  )
}
