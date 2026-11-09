import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rig, easeInOut, lerp } from '../../lib/rig'
import { cached, slab } from '../geo'
import { mats, shared } from '../materials'

const BASE_H = 0.3
const LID_H = 0.16

function Bud({ side, group }: { side: 1 | -1; group: React.RefObject<THREE.Group | null> }) {
  const m = mats.buds
  return (
    <group ref={group} scale={[side, 1, 1]}>
      {/* body */}
      <mesh material={m.primary} scale={[1.08, 0.88, 1]}>
        <sphereGeometry args={[0.085, 40, 28]} />
      </mesh>
      {/* nozzle + silicone tip */}
      <mesh position={[-0.08, -0.005, 0.01]} rotation={[0, 0, Math.PI / 2]} material={m.secondary}>
        <cylinderGeometry args={[0.036, 0.046, 0.06, 28]} />
      </mesh>
      <mesh position={[-0.115, -0.005, 0.01]} scale={[0.7, 1, 1]} material={m.secondary}>
        <sphereGeometry args={[0.052, 28, 20]} />
      </mesh>
      <mesh position={[-0.148, -0.005, 0.01]} rotation={[0, -Math.PI / 2, 0]} material={shared.black}>
        <circleGeometry args={[0.024, 20]} />
      </mesh>
      {/* stem */}
      <group position={[0.02, -0.06, 0.02]} rotation={[0.18, 0, -0.1]}>
        <mesh position={[0, -0.105, 0]} material={m.primary}>
          <capsuleGeometry args={[0.027, 0.17, 10, 24]} />
        </mesh>
        <mesh position={[0, -0.215, 0.0]} material={shared.black}>
          <sphereGeometry args={[0.012, 10, 10]} />
        </mesh>
        <mesh position={[0, -0.06, 0.027]} material={shared.glowCyan}>
          <circleGeometry args={[0.008, 12]} />
        </mesh>
      </group>
      {/* mic + touch sensor */}
      <mesh position={[0.02, 0.05, 0.082]} material={shared.black}>
        <circleGeometry args={[0.01, 12]} />
      </mesh>
      <mesh position={[0.025, 0.0, -0.085]} rotation={[0, Math.PI, 0]} material={m.secondary}>
        <circleGeometry args={[0.04, 24]} />
      </mesh>
    </group>
  )
}

export function Buds() {
  const m = mats.buds
  const lid = useRef<THREE.Group>(null)
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const led = useRef<THREE.MeshBasicMaterial>(null)
  const geo = useMemo(() => ({
    base: cached('bd-base', () => slab(0.66, 0.46, 0.18, BASE_H, 0.025, 5)),
    lid: cached('bd-lid', () => slab(0.66, 0.46, 0.18, LID_H, 0.025, 5)),
    tray: cached('bd-tray', () => slab(0.58, 0.38, 0.14, 0.01, 0.002, 2)),
  }), [])

  useFrame(() => {
    const o = easeInOut(rig.caseOpen)
    const out = easeInOut(rig.budsOut)
    if (lid.current) lid.current.rotation.x = -o * 1.95
    // buds rise out of their wells, rotate to face the viewer, and drift apart
    const rise = out * 0.95
    if (left.current) {
      left.current.position.set(lerp(-0.15, -0.5, out), BASE_H + 0.04 + rise, lerp(0, 0.12, out))
      left.current.rotation.set(0, out * 0.5, out * 0.25)
    }
    if (right.current) {
      right.current.position.set(lerp(0.15, 0.5, out), BASE_H + 0.04 + rise, lerp(0, 0.12, out))
      right.current.rotation.set(0, -out * 0.5, -out * 0.25)
    }
    if (led.current) led.current.color.setRGB(0.3, 1.2 + rig.pulse, 1.6 + rig.pulse * 1.2)
  })

  return (
    <group position={[0, -0.23, 0]}>
      {/* case body (extrusion axis rotated to Y) */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={geo.base} material={m.primary} position={[0, 0, BASE_H / 2]} />
      </group>
      {/* tray & wells */}
      <mesh geometry={geo.tray} rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_H + 0.002, 0]} material={shared.black} />
      {[-0.15, 0.15].map((x) => (
        <mesh key={x} position={[x, BASE_H + 0.0085, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shared.darkMetal}>
          <ringGeometry args={[0.07, 0.115, 40]} />
        </mesh>
      ))}
      {/* status LED */}
      <mesh position={[0, 0.15, 0.2325]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.012, 16]} />
        <meshBasicMaterial ref={led} color="#55E6FF" toneMapped={false} />
      </mesh>
      {/* lid, hinged at the rear edge */}
      <group ref={lid} position={[0, BASE_H, -0.23]}>
        <group position={[0, 0, 0.23]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={geo.lid} material={m.primary} position={[0, 0, LID_H / 2]} />
        </group>
        <mesh position={[0, LID_H + 0.002, 0.23]} rotation={[-Math.PI / 2, 0, 0]} material={shared.glowCyan}>
          <ringGeometry args={[0.052, 0.058, 40]} />
        </mesh>
        <mesh position={[0, 0.001, 0.23]} rotation={[Math.PI / 2, 0, 0]} material={shared.black}>
          <planeGeometry args={[0.5, 0.3]} />
        </mesh>
      </group>
      <Bud side={1} group={right} />
      <Bud side={-1} group={left} />
    </group>
  )
}
