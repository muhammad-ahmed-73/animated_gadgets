import { useState, type ReactNode } from 'react'
import { SECTIONS, SWATCHES } from '../data/products'
import { sound } from '../lib/audio'

export function Section({ index, className = '', children }: { index: number; className?: string; children: ReactNode }) {
  const info = SECTIONS[index]
  return (
    <section id={'s-' + info.id} className="section" style={{ height: `${info.vh}svh` }} aria-label={info.label}>
      <div className={'panel ' + className}>{children}</div>
    </section>
  )
}

export function Eyebrow({ index, children }: { index: number; children: ReactNode }) {
  return (
    <p className="eyebrow mono">
      <b>{SECTIONS[index].index}</b>
      {children}
    </p>
  )
}

export function Swatches({ value, onChange, label }: { value: string; onChange: (hex: string) => void; label: string }) {
  return (
    <div className="swatches" role="radiogroup" aria-label={label}>
      {SWATCHES.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={value === s.hex}
          aria-label={s.name}
          title={s.name}
          data-cursor="link"
          className={'swatch' + (value === s.hex ? ' is-on' : '')}
          style={{ background: s.hex }}
          onClick={() => { sound.blip(740); onChange(s.hex) }}
        />
      ))}
    </div>
  )
}

export function Chip({ on, onClick, children }: { on?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={'chip' + (on ? ' is-on' : '')} aria-pressed={on} data-cursor="link" onClick={() => { sound.blip(on ? 520 : 760); onClick() }}>
      {children}
    </button>
  )
}

/** Configuration panel. On narrow screens it starts collapsed so the 3D product stays visible. */
export function Hud({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(() => !window.matchMedia('(max-width: 900px)').matches)
  return (
    <div className={'hud' + (open ? '' : ' is-collapsed')}>
      <button type="button" className="hud__toggle mono" aria-expanded={open} data-cursor="link" onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        <i aria-hidden="true">{open ? '–' : '+'}</i>
      </button>
      {open && children}
    </div>
  )
}

export const DragHint = ({ label = 'Drag to rotate' }: { label?: string }) => (
  <span className="hint mono"><i aria-hidden="true" />{label}</span>
)
