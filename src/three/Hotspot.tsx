import { useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothstep } from '../lib/rig'

const wp = new THREE.Vector3()
const wn = new THREE.Vector3()
const wq = new THREE.Quaternion()
const toCam = new THREE.Vector3()

interface HotspotProps {
  position: [number, number, number]
  /** local-space outward normal: the hotspot fades when facing away from the camera */
  normal: [number, number, number]
  label: string
  active: boolean
  /** 0..1 getter for global visibility */
  weight: () => number
  onSelect: () => void
}

/** Camera-facing interactive hotspot anchored to a 3D point. */
export function Hotspot({ position, normal, label, active, weight, onSelect }: HotspotProps) {
  const anchor = useRef<THREE.Group>(null)
  const el = useRef<HTMLButtonElement>(null)
  const nrm = useRef(new THREE.Vector3(...normal))

  useFrame(({ camera }) => {
    const g = anchor.current
    const b = el.current
    if (!g || !b) return
    g.getWorldPosition(wp)
    g.getWorldQuaternion(wq)
    wn.copy(nrm.current).applyQuaternion(wq)
    toCam.copy(camera.position).sub(wp).normalize()
    const facing = wn.dot(toCam)
    const o = smoothstep(0.1, 0.45, facing) * weight()
    b.style.opacity = String(o)
    b.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
    b.style.transform = `scale(${0.7 + o * 0.3})`
  })

  return (
    <group ref={anchor} position={position}>
      <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <button
          ref={el}
          type="button"
          className={'hotspot' + (active ? ' is-active' : '')}
          data-cursor="link"
          aria-label={label}
          onClick={onSelect}
        >
          <span className="hotspot__dot" />
          <span className="hotspot__label">{label}</span>
        </button>
      </Html>
    </group>
  )
}

interface AnnoProps {
  position: [number, number, number]
  index: string
  title: string
  value: string
  /** returns 0..1 visibility */
  weight: () => number
  side?: 'left' | 'right'
}

/** Technical leader-line annotation used in exploded views. */
export function Annotation({ position, index, title, value, weight, side = 'right' }: AnnoProps) {
  const el = useRef<HTMLDivElement>(null)
  useFrame(() => {
    if (el.current) {
      const w = weight()
      el.current.style.opacity = String(w)
      el.current.style.transform = `translateX(${(1 - w) * (side === 'right' ? -14 : 14)}px)`
    }
  })
  return (
    <group position={position}>
      <Html zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={el} className={'anno anno--' + side} style={{ opacity: 0 }}>
          <span className="anno__line" />
          <span className="anno__body">
            <span className="anno__idx">{index}</span>
            <span className="anno__title">{title}</span>
            <span className="anno__val">{value}</span>
          </span>
        </div>
      </Html>
    </group>
  )
}
