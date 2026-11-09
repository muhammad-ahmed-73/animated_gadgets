import { useRef } from 'react'
import { S } from '../data/products'
import { rig } from '../lib/rig'
import { Lines } from '../ui/Lines'
import { useSectionStep, useTick } from '../ui/hooks'
import { Eyebrow, Section } from './common'

const STEPS = [
  ['01', 'Display assembly lifts away'],
  ['02', 'Alloy frame releases'],
  ['03', 'N1 logic board exposed'],
  ['04', 'NOVA cell drifts free'],
  ['05', 'Back glass separates'],
  ['06', 'Spatial camera emerges'],
]

export function Engineering() {
  const step = useSectionStep(S.engineering, [0.22, 0.34, 0.46, 0.58, 0.7, 0.82])
  const bar = useRef<HTMLElement>(null)
  const num = useRef<HTMLElement>(null)
  useTick(() => {
    if (bar.current) bar.current.style.transform = `scaleX(${rig.explode})`
    if (num.current) num.current.textContent = String(Math.round(rig.explode * 100)).padStart(3, '0') + '%'
  })
  return (
    <Section index={S.engineering}>
      <div className="col">
        <Eyebrow index={S.engineering}>Engineered to perfection</Eyebrow>
        <h2 className="h-lg">
          <Lines as="span" lines={['EVERY DETAIL.', 'REIMAGINED.']} lineClass={['', 'grad']} />
        </h2>
        <p className="lead">One hundred and forty-two components, each machined, tuned and placed with intent. Scroll to take the NOVA Phone apart.</p>
      </div>
      <div className="between">
        <ul className="steps mono" aria-label="Disassembly sequence">
          {STEPS.map(([n, t], i) => (
            <li key={n} className={i <= step ? 'is-on' : ''}><em>{n}</em>{t}</li>
          ))}
        </ul>
        <div className="readout mono">
          <span style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
            Separation <b ref={num as React.RefObject<HTMLElement>} style={{ color: 'var(--white)', fontWeight: 500 }}>000%</b>
          </span>
          <div className="readout__bar"><i ref={bar as React.RefObject<HTMLElement>} /></div>
        </div>
      </div>
    </Section>
  )
}
