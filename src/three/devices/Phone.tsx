import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { rig, easeInOut, clamp01 } from '../../lib/rig'
import { cached, flatRounded, ring, slab } from '../geo'
import { mats, shared } from '../materials'
import { makeBatteryLabel, makePCB, makePhoneScreen } from '../textures'
import { Annotation, Hotspot } from '../Hotspot'
import { S } from '../../data/products'

const W = 0.78, H = 1.62, D = 0.088

const win = (e: number, a: number, b: number) => easeInOut(clamp01((e - a) / (b - a)))

export const PHONE_HOTSPOTS = [
  { id: 'display', label: 'Display', pos: [0.2, 0.62, D / 2 + 0.02] as [number, number, number], normal: [0, 0, 1] as [number, number, number],
    title: 'Aurora LTPO display', text: '6.7-inch, 144 Hz adaptive panel with 3,000 nits peak brightness and an anti-reflective sapphire layer.' },
  { id: 'lens', label: 'Spatial camera', pos: [0.17, H / 2 - 0.31, -D / 2 - 0.05] as [number, number, number], normal: [0, 0, -1] as [number, number, number],
    title: '200 MP spatial array', text: 'Three optically stabilised lenses with a LiDAR depth sensor capture the world in true three dimensions.' },
  { id: 'frame', label: 'Frame', pos: [W / 2 + 0.01, -0.15, 0] as [number, number, number], normal: [1, 0, 0] as [number, number, number],
    title: 'Machined alloy frame', text: 'Aerospace-grade titanium alloy, milled from a single block and finished with micro-blasted edges.' },
  { id: 'port', label: 'USB-C 4.0', pos: [0, -H / 2 - 0.01, 0] as [number, number, number], normal: [0, -1, 0] as [number, number, number],
    title: 'USB-C 4.0 · 90 W', text: 'Full charge in 28 minutes, 40 Gbps data and wireless charging on the back glass.' },
]

function Lens({ x, y, big = 1 }: { x: number; y: number; big?: number }) {
  const m = mats.phone
  return (
    <group position={[x, y, 0]} scale={big}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.012]} material={shared.black}>
        <cylinderGeometry args={[0.072, 0.072, 0.026, 40]} />
      </mesh>
      <mesh position={[0, 0, 0.026]} material={m.primary}>
        <torusGeometry args={[0.066, 0.011, 16, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.026]} material={shared.lensGlass}>
        <cylinderGeometry args={[0.056, 0.056, 0.012, 40]} />
      </mesh>
      <mesh position={[0, 0, 0.034]} material={shared.lensCoat}>
        <circleGeometry args={[0.034, 32]} />
      </mesh>
      <mesh position={[-0.018, 0.02, 0.036]} material={shared.glowCyan}>
        <circleGeometry args={[0.006, 12]} />
      </mesh>
    </group>
  )
}

export function Phone() {
  const frameG = useRef<THREE.Group>(null)
  const screenG = useRef<THREE.Group>(null)
  const boardG = useRef<THREE.Group>(null)
  const batteryG = useRef<THREE.Group>(null)
  const backG = useRef<THREE.Group>(null)
  const moduleG = useRef<THREE.Group>(null)
  const screenMat = useRef<THREE.MeshStandardMaterial>(null)
  const phoneScreen = useStore((s) => s.phoneScreen)

  const g = useMemo(() => ({
    frame: cached('ph-frame', () => ring(W, H, 0.125, 0.034, D, 0.012)),
    glass: cached('ph-glass', () => slab(W - 0.05, H - 0.05, 0.108, 0.014, 0.005)),
    screen: cached('ph-screen', () => flatRounded(W - 0.07, H - 0.07, 0.098)),
    back: cached('ph-back', () => slab(W - 0.045, H - 0.045, 0.11, 0.016, 0.006)),
    island: cached('ph-island', () => slab(0.44, 0.44, 0.1, 0.022, 0.008)),
    pcb: cached('ph-pcb', () => slab(W - 0.2, 0.66, 0.04, 0.016, 0.004)),
    pcbTex: cached('ph-pcbtex', () => flatRounded(W - 0.21, 0.65, 0.035)),
    battery: cached('ph-bat', () => slab(W - 0.2, 0.82, 0.045, 0.03, 0.01)),
    batTex: cached('ph-battex', () => flatRounded(W - 0.22, 0.8, 0.035)),
    chip: cached('ph-chip', () => new THREE.BoxGeometry(1, 1, 1)),
  }), [])

  const tex = useMemo(() => ({ pcb: makePCB(), bat: makeBatteryLabel() }), [])
  const screens = useRef<THREE.CanvasTexture[]>([])
  useEffect(() => () => {
    tex.pcb.dispose(); tex.bat.dispose(); screens.current.forEach((t) => t.dispose()); screens.current = []
  }, [tex])

  // screen textures are generated lazily so fonts are guaranteed to be loaded
  const screenTexture = useMemo(() => {
    if (!screens.current[phoneScreen]) screens.current[phoneScreen] = makePhoneScreen(phoneScreen)
    return screens.current[phoneScreen]
  }, [phoneScreen])

  useFrame(() => {
    const e = rig.explode
    const set = (r: React.RefObject<THREE.Group | null>, z: number, x = 0, y = 0) => {
      if (r.current) r.current.position.set(x, y, z)
    }
    set(screenG, win(e, 0.0, 0.5) * 1.35, 0, win(e, 0.0, 0.5) * 0.05)
    set(frameG, win(e, 0.18, 0.62) * 0.66)
    set(boardG, win(e, 0.3, 0.72) * 0.1, win(e, 0.3, 0.72) * -0.0, win(e, 0.3, 0.72) * 0.0)
    set(batteryG, win(e, 0.4, 0.82) * -0.42)
    set(backG, win(e, 0.5, 0.92) * -0.92)
    set(moduleG, win(e, 0.62, 1.0) * -1.5)
    if (screenMat.current) screenMat.current.emissiveIntensity = 1.15 * rig.screenOn
  })

  const m = mats.phone
  const chips: [number, number, number, number, number, number][] = [
    // x, y, w, h, d, kind
    [0.0, 0.18, 0.22, 0.22, 0.03, 0],
    [-0.17, 0.2, 0.12, 0.14, 0.02, 1],
    [0.18, 0.12, 0.1, 0.16, 0.02, 1],
    [0.12, 0.26, 0.14, 0.08, 0.018, 2],
    [-0.15, -0.02, 0.16, 0.08, 0.016, 2],
    [0.12, -0.04, 0.1, 0.1, 0.016, 1],
  ]

  return (
    <group>
      {/* ------------------------------------------------------------ frame */}
      <group ref={frameG}>
        <mesh geometry={g.frame} material={m.primary} />
        {/* side buttons */}
        <mesh position={[W / 2 + 0.002, 0.28, 0]} material={m.primary}>
          <boxGeometry args={[0.014, 0.24, 0.036]} />
        </mesh>
        <mesh position={[-W / 2 - 0.002, 0.34, 0]} material={m.primary}>
          <boxGeometry args={[0.014, 0.13, 0.036]} />
        </mesh>
        <mesh position={[-W / 2 - 0.002, 0.16, 0]} material={m.primary}>
          <boxGeometry args={[0.014, 0.13, 0.036]} />
        </mesh>
        {/* USB-C port + speaker holes */}
        <mesh position={[0, -H / 2 + 0.002, 0]} material={shared.black}>
          <boxGeometry args={[0.1, 0.012, 0.028]} />
        </mesh>
        {[-0.2, -0.16, -0.12, 0.12, 0.16, 0.2].map((x) => (
          <mesh key={x} position={[x, -H / 2 + 0.002, 0]} material={shared.black}>
            <sphereGeometry args={[0.009, 8, 8]} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------ display assembly */}
      <group ref={screenG}>
        <mesh geometry={g.glass} material={shared.glass} position={[0, 0, D / 2 - 0.018]} />
        <mesh geometry={g.screen} position={[0, 0, D / 2 - 0.0105]}>
          <meshStandardMaterial
            ref={screenMat}
            color="#000"
            emissive="#fff"
            emissiveMap={screenTexture}
            emissiveIntensity={1.15}
            roughness={0.12}
            metalness={0.2}
            envMapIntensity={0.8}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------ logic board */}
      <group ref={boardG}>
        <group position={[0, 0.4, -0.004]}>
          <mesh geometry={g.pcb}>
            <meshStandardMaterial color="#0a1a33" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh geometry={g.pcbTex} position={[0, 0, 0.0085]}>
            <meshStandardMaterial map={tex.pcb} emissiveMap={tex.pcb} emissive="#6ad8ff" emissiveIntensity={0.55} roughness={0.55} metalness={0.4} />
          </mesh>
          {chips.map(([x, y, w, h, d, kind], i) => (
            <mesh key={i} geometry={g.chip} position={[x, y - 0.1, 0.012 + d / 2]} scale={[w, h, d]}
              material={kind === 0 ? shared.silver : kind === 1 ? shared.darkMetal : shared.black} />
          ))}
          <mesh position={[0, 0.08, 0.0445]} material={shared.glowCyan}>
            <planeGeometry args={[0.1, 0.004]} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------ battery */}
      <group ref={batteryG}>
        <group position={[0, -0.34, -0.006]}>
          <mesh geometry={g.battery}>
            <meshStandardMaterial color="#d9dee6" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh geometry={g.batTex} position={[0, 0, 0.0165]}>
            <meshStandardMaterial map={tex.bat} roughness={0.5} metalness={0.2} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------ back glass */}
      <group ref={backG}>
        <mesh geometry={g.back} material={m.secondary} position={[0, 0, -D / 2 + 0.018]} />
      </group>

      {/* ------------------------------------------------------------ camera system */}
      <group ref={moduleG}>
        <group position={[0.17, H / 2 - 0.31, -D / 2 + 0.002]} rotation={[0, Math.PI, 0]}>
          <mesh geometry={g.island} material={shared.glass} position={[0, 0, 0.008]} />
          <Lens x={-0.09} y={0.095} />
          <Lens x={-0.09} y={-0.095} />
          <Lens x={0.095} y={0} big={0.92} />
          <mesh position={[0.1, 0.155, 0.02]} material={shared.warm}>
            <circleGeometry args={[0.018, 20]} />
          </mesh>
          <mesh position={[0.1, -0.155, 0.02]} material={shared.black}>
            <circleGeometry args={[0.014, 20]} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------ exploded-view annotations */}
      <Annotation position={[W / 2 + 0.05, 0.5, 1.36]} index="01" title="DISPLAY" value="LTPO · 144 Hz" weight={() => win(rig.explode, 0.35, 0.6) * rig.w[S.engineering]} />
      <Annotation position={[W / 2 + 0.05, 0.1, 0.7]} index="02" title="ALLOY FRAME" value="Grade-5 titanium" weight={() => win(rig.explode, 0.5, 0.75) * rig.w[S.engineering]} />
      <Annotation position={[W / 2 - 0.1, 0.55, 0.12]} index="03" title="N1 NEURAL" value="3 nm · 16 cores" weight={() => win(rig.explode, 0.6, 0.85) * rig.w[S.engineering]} />
      <Annotation position={[W / 2 - 0.1, -0.35, -0.42]} index="04" title="NOVA CELL" value="5,200 mAh" weight={() => win(rig.explode, 0.7, 0.92) * rig.w[S.engineering]} />
      <Annotation position={[W / 2, -0.55, -0.92]} index="05" title="BACK GLASS" value="Gorilla-class glass" weight={() => win(rig.explode, 0.8, 0.97) * rig.w[S.engineering]} />
      <Annotation position={[-0.1, H / 2 - 0.1, -1.5]} index="06" title="SPATIAL CAMERA" value="200 MP · LiDAR" weight={() => win(rig.explode, 0.88, 1) * rig.w[S.engineering]} side="left" />

      <PhoneHotspots />
    </group>
  )
}

function PhoneHotspots() {
  const active = useStore((s) => s.activeSection)
  const hot = useStore((s) => s.phoneHotspot)
  const set = useStore((s) => s.set)
  if (active !== S.phone) return null
  return (
    <>
      {PHONE_HOTSPOTS.map((h) => (
        <Hotspot
          key={h.id}
          position={h.pos}
          normal={h.normal}
          label={h.label}
          active={hot === h.id}
          weight={() => (1 - rig.explode) * rig.w[S.phone]}
          onSelect={() => set({ phoneHotspot: hot === h.id ? null : h.id })}
        />
      ))}
    </>
  )
}
