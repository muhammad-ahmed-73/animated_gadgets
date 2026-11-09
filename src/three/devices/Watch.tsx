import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { rig } from '../../lib/rig'
import { bentStrap, cached, flatRounded, slab } from '../geo'
import { mats, shared } from '../materials'
import { makeWatchFaceTexture } from '../textures'
import { Hotspot } from '../Hotspot'
import { S } from '../../data/products'

const CW = 0.8, CH = 0.96, CD = 0.24

export const WATCH_HOTSPOTS = [
  { id: 'display', label: 'Display', pos: [0.18, 0.28, CD / 2 + 0.03] as [number, number, number], normal: [0, 0, 1] as [number, number, number],
    title: 'Micro-LED, always alive', text: 'A 1.9-inch micro-LED panel reaching 3,000 nits, wrapped in a sapphire dome that is second only to diamond in hardness.' },
  { id: 'crown', label: 'Crown', pos: [CW / 2 + 0.08, 0.15, 0] as [number, number, number], normal: [1, 0, 0] as [number, number, number],
    title: 'Haptic crown', text: 'Precision-milled with a micro-haptic engine that gives every scroll a tactile click.' },
  { id: 'sensor', label: 'Bio-sensor', pos: [0, 0, -CD / 2 - 0.05] as [number, number, number], normal: [0, 0, -1] as [number, number, number],
    title: 'Quad bio-sensor', text: 'ECG, blood-oxygen, skin-temperature and heart-rate sensing from a single ceramic-and-sapphire back.' },
  { id: 'strap', label: 'Strap', pos: [0, 0.98, 0.04] as [number, number, number], normal: [0, 0, 1] as [number, number, number],
    title: 'Quick-release strap', text: 'A silent magnetic lug lets the strap separate in one motion. Fluoroelastomer, in five finishes.' },
]

export function Watch() {
  const strapTop = useRef<THREE.Group>(null)
  const strapBot = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const screenMat = useRef<THREE.MeshStandardMaterial>(null)
  const face = useMemo(() => makeWatchFaceTexture(), [])
  useEffect(() => () => face.texture.dispose(), [face])

  const g = useMemo(() => ({
    caseG: cached('w-case', () => slab(CW, CH, 0.24, CD, 0.03, 5)),
    glass: cached('w-glass', () => slab(CW - 0.06, CH - 0.06, 0.2, 0.05, 0.022, 6)),
    screen: cached('w-screen', () => flatRounded(0.64, 0.78, 0.16)),
    strap: cached('w-strap', () => bentStrap(0.5, 0.95, 0.075, 0.78)),
  }), [])

  const anim = useRef({ from: 0, to: 0, mix: 1, acc: 0 })
  const m = mats.watch

  useFrame(({ clock }, dt) => {
    const a = anim.current
    const target = useStore.getState().watchFace
    if (target !== a.to) { a.from = a.to; a.to = target; a.mix = 0 }
    if (a.mix < 1) a.mix = Math.min(1, a.mix + dt * 1.8)
    // straps separate along their own axis
    const sep = rig.strap * 0.95
    if (strapTop.current) strapTop.current.position.y = CH / 2 - 0.05 + sep
    if (strapBot.current) strapBot.current.position.y = -CH / 2 + 0.05 - sep
    if (screenMat.current) screenMat.current.emissiveIntensity = 1.3 * rig.watchOn

    // redraw the face only while visible, throttled
    a.acc += dt
    const visible = root.current?.parent?.visible !== false
    if (visible && (a.mix < 1 || a.acc > 0.066)) {
      a.acc = 0
      face.draw(a.from, a.to, a.mix >= 1 ? 0 : a.mix, clock.elapsedTime)
    }
  })

  return (
    <group ref={root}>
      <mesh geometry={g.caseG} material={m.primary} />
      {/* inner bezel */}
      <mesh position={[0, 0, CD / 2 - 0.002]} material={shared.black}>
        <planeGeometry args={[CW - 0.1, CH - 0.1]} />
      </mesh>
      <mesh geometry={g.screen} position={[0, 0, CD / 2 + 0.004]}>
        <meshStandardMaterial ref={screenMat} color="#000" emissive="#fff" emissiveMap={face.texture} emissiveIntensity={1.3} roughness={0.2} />
      </mesh>
      <mesh geometry={g.glass} material={shared.clearGlass} position={[0, 0, CD / 2 + 0.012]} renderOrder={2} />

      {/* crown + side button */}
      <mesh position={[CW / 2 + 0.03, 0.15, 0]} rotation={[0, 0, Math.PI / 2]} material={m.primary}>
        <cylinderGeometry args={[0.075, 0.075, 0.08, 36]} />
      </mesh>
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[CW / 2 + 0.075, 0.15 + Math.cos((i / 14) * Math.PI * 2) * 0.07, Math.sin((i / 14) * Math.PI * 2) * 0.07]}
          material={shared.darkMetal}>
          <boxGeometry args={[0.006, 0.012, 0.012]} />
        </mesh>
      ))}
      <mesh position={[CW / 2 + 0.075, 0.15, 0]} rotation={[0, 0, Math.PI / 2]} material={shared.glowCyan}>
        <cylinderGeometry args={[0.03, 0.03, 0.004, 24]} />
      </mesh>
      <mesh position={[CW / 2 + 0.012, -0.12, 0]} material={m.primary}>
        <boxGeometry args={[0.04, 0.2, 0.06]} />
      </mesh>

      {/* back sensor */}
      <mesh position={[0, 0, -CD / 2 - 0.012]} rotation={[Math.PI / 2, 0, 0]} material={shared.glass}>
        <cylinderGeometry args={[0.27, 0.3, 0.03, 48]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2 + 0.78) * 0.12, Math.sin((i / 4) * Math.PI * 2 + 0.78) * 0.12, -CD / 2 - 0.03]}
          rotation={[Math.PI, 0, 0]} material={i % 2 ? shared.glowCyan : shared.glowBlue}>
          <circleGeometry args={[0.032, 20]} />
        </mesh>
      ))}

      {/* lugs */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * (CH / 2 + 0.01), 0]} rotation={[0, 0, Math.PI / 2]} material={m.primary}>
          <cylinderGeometry args={[0.05, 0.05, 0.52, 20]} />
        </mesh>
      ))}

      {/* straps */}
      <group ref={strapTop} position={[0, CH / 2 - 0.05, -0.02]}>
        <mesh geometry={g.strap} material={m.secondary} />
      </group>
      <group ref={strapBot} position={[0, -CH / 2 + 0.05, -0.02]} rotation={[0, 0, Math.PI]}>
        <mesh geometry={g.strap} material={m.secondary} />
        {/* buckle */}
        <mesh position={[0, 0.7, -0.44]} rotation={[0.443, 0, 0]} material={mats.watch.primary}>
          <boxGeometry args={[0.58, 0.07, 0.16]} />
        </mesh>
      </group>

      <WatchHotspots />
    </group>
  )
}

function WatchHotspots() {
  const active = useStore((s) => s.activeSection)
  const hot = useStore((s) => s.watchHotspot)
  const set = useStore((s) => s.set)
  if (active !== S.watch) return null
  return (
    <>
      {WATCH_HOTSPOTS.map((h) => (
        <Hotspot
          key={h.id}
          position={h.pos}
          normal={h.normal}
          label={h.label}
          active={hot === h.id}
          weight={() => rig.w[S.watch] * (1 - rig.zoom * 0.8)}
          onSelect={() => set({ watchHotspot: hot === h.id ? null : h.id })}
        />
      ))}
    </>
  )
}
