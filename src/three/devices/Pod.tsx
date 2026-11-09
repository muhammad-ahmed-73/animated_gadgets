import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rig } from '../../lib/rig'
import { cached } from '../geo'
import { mats, shared } from '../materials'
import { makeFabric } from '../textures'

const WHITE = new THREE.Color('#ffffff')

function bodyProfile() {
  const pts: THREE.Vector2[] = []
  const N = 28
  for (let i = 0; i <= N; i++) {
    const t = i / N
    // gentle barrel with rounded shoulders
    const y = 0.08 + t * 0.92
    const bulge = 0.43 + Math.sin(t * Math.PI) * 0.03
    let r = bulge
    if (t > 0.9) r = bulge * Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.9) / 0.1, 2) * 0.35)) * (1 - (t - 0.9) * 0.9)
    pts.push(new THREE.Vector2(r, y))
  }
  return pts
}

export function Pod() {
  const m = mats.pod
  const fabricTex = useMemo(() => makeFabric(), [])
  const fabric = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: fabricTex, roughness: 0.95, metalness: 0, sheen: 1, sheenColor: new THREE.Color('#8aa'), sheenRoughness: 0.6 }),
    [fabricTex],
  )
  useEffect(() => () => { fabric.dispose(); fabricTex.dispose() }, [fabric, fabricTex])
  const ring = useRef<THREE.MeshBasicMaterial>(null)
  const ringMesh = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => ({
    body: cached('pod-body', () => new THREE.LatheGeometry(bodyProfile(), 72)),
    base: cached('pod-base', () => new THREE.CylinderGeometry(0.4, 0.45, 0.08, 64)),
  }), [])

  useFrame(({ clock }) => {
    fabric.color.copy(m.secondary.color).lerp(WHITE, 0.35)
    const k = 1.5 + rig.pulse * 3
    ring.current?.color.setRGB(0.33 * k, 0.9 * k, 1.0 * k)
    if (ringMesh.current) ringMesh.current.scale.setScalar(1 + rig.pulse * 0.05 + Math.sin(clock.elapsedTime * 2) * 0.004)
  })

  return (
    <group position={[0, -0.5, 0]}>
      <mesh geometry={geo.base} material={m.primary} position={[0, 0.04, 0]} />
      <mesh geometry={geo.body} material={fabric} />
      {/* top glass cap with halo ring */}
      <mesh position={[0, 1.003, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shared.glass}>
        <circleGeometry args={[0.31, 64]} />
      </mesh>
      <mesh ref={ringMesh} position={[0, 1.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.325, 96]} />
        <meshBasicMaterial ref={ring} color="#55E6FF" toneMapped={false} />
      </mesh>
      {/* touch glyphs: − • + */}
      <mesh position={[-0.15, 1.008, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shared.glowCyan}>
        <planeGeometry args={[0.07, 0.012]} />
      </mesh>
      <mesh position={[0, 1.008, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shared.glowCyan}>
        <circleGeometry args={[0.028, 24]} />
      </mesh>
      <group position={[0.15, 1.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh material={shared.glowCyan}><planeGeometry args={[0.07, 0.012]} /></mesh>
        <mesh material={shared.glowCyan}><planeGeometry args={[0.012, 0.07]} /></mesh>
      </group>
      {/* trim ring */}
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.primary}>
        <torusGeometry args={[0.435, 0.014, 12, 80]} />
      </mesh>
    </group>
  )
}
