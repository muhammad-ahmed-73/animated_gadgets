import { PRODUCTS, PRODUCT_IDS, SECTIONS, S } from '../data/products'
import { useStore } from '../store/useStore'
import { scrollToSection } from '../lib/scroll'
import { Lines } from '../ui/Lines'
import { Arrow, MagneticButton } from '../ui/MagneticButton'
import { NovaLogo } from '../ui/NovaLogo'
import { Eyebrow, Section } from './common'

export function Finale() {
  const set = useStore((s) => s.set)
  return (
    <>
      <Section index={S.finale} className="finale-wrap">
        <div className="col">
          <Eyebrow index={S.finale}>The final transmission</Eyebrow>
          <h2 className="h-xl">
            <Lines as="span" lines={['THE FUTURE', 'STARTS HERE.']} lineClass={['', 'grad']} start="top 30%" />
          </h2>
          <MagneticButton onClick={() => scrollToSection(S.ecosystem, 0, 3)}>
            Explore NOVA <Arrow />
          </MagneticButton>
        </div>
      </Section>
      <footer className="foot">
        <div className="foot__grid">
          <div>
            <NovaLogo className="nav__logo" />
            <p className="mono" style={{ color: 'var(--muted)', marginTop: '1.4rem', lineHeight: 1.8 }}>Technology<br />beyond imagination.</p>
          </div>
          <div>
            <h5 className="mono">Navigate</h5>
            <ul>
              {SECTIONS.filter((_, i) => [0, 1, 2, 6].includes(i)).map((s) => (
                <li key={s.id}><a href={'#s-' + s.id} data-cursor="link" onClick={(e) => { e.preventDefault(); scrollToSection(SECTIONS.indexOf(s)) }}>{s.label}</a></li>
              ))}
              <li><button type="button" data-cursor="link" onClick={() => set({ menuOpen: true })}>Full index</button></li>
            </ul>
          </div>
          <div>
            <h5 className="mono">Products</h5>
            <ul>
              {PRODUCT_IDS.map((id) => (
                <li key={id}>
                  <button type="button" data-cursor="link" onClick={() => { set({ focus: id }); scrollToSection(S.ecosystem, 0.3, 2.6) }}>{PRODUCTS[id].name}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mono">Social</h5>
            <ul>
              {['Instagram', 'YouTube', 'X / Twitter', 'LinkedIn'].map((n) => (
                <li key={n}><a href="#footer" data-cursor="link" onClick={(e) => e.preventDefault()}>{n}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="foot__legal mono" id="footer">
          <span>© 2026 NOVA. All rights reserved.</span>
          <p>NOVA is a fictional brand. This website is a non-commercial concept project created to explore interactive 3D design. All products shown are original conceptual models; no real products are offered or sold.</p>
        </div>
      </footer>
    </>
  )
}
