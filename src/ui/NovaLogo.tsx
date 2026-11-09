/**
 * NOVA wordmark — N · O · V · Λ.
 * The O is an orbit ring with a cyan satellite, the V is open at the top like an aperture,
 * and the A drops its crossbar so the four glyphs read as a single instrument.
 */
export function NovaLogo({ className, draw = false }: { className?: string; draw?: boolean }) {
  const p = draw ? { pathLength: 1 } : {}
  return (
    <svg className={className} viewBox="0 0 182 44" role="img" aria-label="NOVA" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="square">
      {/* N */}
      <polyline points="3,42 3,3 31,42 31,3" {...p} className="lg-n" />
      {/* O + orbit */}
      <circle cx="68" cy="22.5" r="19" {...p} className="lg-o" />
      <circle cx="84.5" cy="9.5" r="3.6" fill="#55E6FF" stroke="none" className="lg-dot" />
      {/* V */}
      <polyline points="102,3 118,42 134,3" {...p} className="lg-v" />
      {/* A (no crossbar) */}
      <polyline points="148,42 164,3 180,42" {...p} className="lg-a" />
    </svg>
  )
}
