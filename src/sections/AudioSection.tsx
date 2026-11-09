import { Hud } from './common'
import { FINISHES, S } from '../data/products'
import { useStore } from '../store/useStore'
import { flags } from '../lib/rig'
import { Lines } from '../ui/Lines'
import { toggleSound } from '../ui/Nav'
import { Chip, DragHint, Eyebrow, Section, Swatches } from './common'

export function AudioSection() {
  const buds = useStore((s) => s.custom.buds)
  const hp = useStore((s) => s.custom.headphones)
  const setCustom = useStore((s) => s.setCustom)
  const caseOpen = useStore((s) => s.caseOpen)
  const budsOut = useStore((s) => s.budsOut)
  const soundOn = useStore((s) => s.soundOn)
  const set = useStore((s) => s.set)

  const applyColour = (hex: string) => {
    setCustom('buds', { primary: hex })
    setCustom('headphones', { primary: hex })
  }
  const applyFinish = (f: (typeof FINISHES)[number]) => {
    setCustom('buds', { finish: f })
    setCustom('headphones', { finish: f })
  }
  const touch = () => { flags.audioTouched = true }

  return (
    <Section index={S.audio} className="stack">
      <div className="col">
        <Eyebrow index={S.audio}>Sound without limits</Eyebrow>
        <h2 className="h-lg">
          <Lines as="span" lines={['FEEL EVERY', 'FREQUENCY.']} lineClass={['', 'grad']} />
        </h2>
        <p className="lead">NOVA Buds and NOVA Headphones, tuned as a pair. Sound is optional — switch it on and the whole scene starts to breathe.</p>
      </div>

      <div className="right-col controls ui">
        <Hud title="Listening room">
          <div className="field"><div className="mono">Atmosphere</div>
            <Chip on={soundOn} onClick={toggleSound}>{soundOn ? 'Sound on' : 'Sound off'}</Chip></div>
          <div className="field"><div className="mono">Case</div>
            <div className="row">
              <Chip on={caseOpen} onClick={() => { touch(); set({ caseOpen: !caseOpen, budsOut: caseOpen ? false : budsOut }) }}>{caseOpen ? 'Close case' : 'Open case'}</Chip>
              <Chip on={budsOut} onClick={() => { touch(); set({ budsOut: !budsOut, caseOpen: budsOut ? caseOpen : true }) }}>{budsOut ? 'Return buds' : 'Release buds'}</Chip>
            </div></div>
          <div className="field"><div className="mono">Colourway</div>
            <Swatches label="Colourway" value={buds.primary} onChange={applyColour} /></div>
          <div className="field"><div className="mono">Finish <em>{hp.finish}</em></div>
            <div className="row">{FINISHES.map((f) => <Chip key={f} on={buds.finish === f} onClick={() => applyFinish(f)}>{f}</Chip>)}</div></div>
        </Hud>
      </div>
      <div className="left-col"><DragHint label="Drag either product to inspect" /></div>
    </Section>
  )
}
