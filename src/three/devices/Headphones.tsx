import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rig } from '../../lib/rig'
import { cached } from '../geo'
import { mats, shared } from '../materials'

function cupProfile() {
  const pts: THREE.Vector2[] = []
  const prof: [number, number][] = [
    [0.0, 0.0], [0.23, 0.0], [0.285, 0.02], [0.305, 0.055], [0.305, 0.1], [0.29, 0.135],
    [0.25, 0.155], [0.18, 0.162], [0.0, 0.162],
  ]
  prof.forEach(([r, y]) => pts.push(new THREE.Vector2(r, y)))
  return pts
}

function Cup({ side }: { side: 1 | -1 }) {
  const m = mats.headphones
  const g = useMemo(() => ({
    shell: cached('hp-shell', () => new THREE.LatheGeometry(cupProfile(), 64)),
    cushion: cached('hp-cushion', () => new THREE.TorusGeometry(0.205, 0.075, 28, 64)),
  }), [])
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(() => {
    if (ringMat.current) {
      const k = 1.5 + rig.pulse * 2.2
      ringMat.current.color.setRGB(0.33 * k, 0.9 * k, 1.0 * k)
    }
  })
  return (
    // lathe axis (+Y) points outward (+X for the right cup)
    <group position={[side * 0.66, -0.12, 0]} rotation={[0, 0, -side * Math.PI / 2]}>
      <mesh geometry={g.shell} material={m.primary} position={[0, 0.0, 0]} />
      {/* outer plate */}
      <mesh position={[0, 0.1635, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shared.glass}>
        <circleGeometry args={[0.2, 56]} />
      </mesh>
      <mesh position={[0, 0.1645, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.158, 64]} />
        <meshBasicMaterial ref={ringMat} color="#55E6FF" toneMapped={false} />
      </mesh>
      {/* cushion, on the head side */}
      <mesh geometry={g.cushion} material={m.secondary} position={[0, -0.03, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.8]} />
      <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]} material={shared.rubber}>
        <circleGeometry args={[0.2, 40]} />
      </mesh>
      {/* yoke pivot */}
      <mesh position={[0, 0.05, 0.31]} rotation={[0, 0, 0]} material={m.primary}>
        <sphereGeometry args={[0.032, 20, 16]} />
      </mesh>
      <mesh position={[0, 0.05, -0.31]} material={m.primary}>
        <sphereGeometry args={[0.032, 20, 16]} />
      </mesh>
    </group>
  )
}

export function Headphones() {
  const m = mats.headphones
  return (
    <group position={[0, -0.05, 0]}>
      {/* headband — flattened torus arc */}
      <mesh position={[0, 0.32, 0]} scale={[1, 1.05, 1.6]} material={m.primary}>
        <torusGeometry args={[0.66, 0.042, 20, 80, Math.PI]} />
      </mesh>
      {/* cushioned underside */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI * 0.15]} scale={[1, 1, 1.45]} material={m.secondary}>
        <torusGeometry args={[0.6, 0.05, 20, 80, Math.PI * 0.7]} />
      </mesh>
      {/* sliders + yokes */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.66, 0.2, 0]} material={shared.silver}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 14]} />
          </mesh>
          <mesh position={[s * 0.66, 0.05, 0]} material={m.primary}>
            <boxGeometry args={[0.045, 0.28, 0.04]} />
          </mesh>
          <mesh position={[s * 0.66, -0.07, 0]} material={m.primary}>
            <boxGeometry args={[0.045, 0.03, 0.64]} />
          </mesh>
          <Cup side={s as 1 | -1} />
        </group>
      ))}
    </group>
  )
}
