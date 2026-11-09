import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { PRODUCT_IDS, S, type ProductId } from '../data/products'
import { useStore } from '../store/useStore'
import { damp } from '../lib/rig'
import { pointer } from '../lib/pointer'
import { Phone } from './devices/Phone'
import { Watch } from './devices/Watch'
import { Buds } from './devices/Buds'
import { Headphones } from './devices/Headphones'
import { Pod } from './devices/Pod'

/** World-space registry used by the director and the connection graph. */
export const deviceGroups: Partial<Record<ProductId, THREE.Group>> = {}

const TAU = Math.PI * 2

function DeviceRig({ id, children }: { id: ProductId; children: ReactNode }) {
  const outer = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const u = useRef({ x: 0, y: 0, vx: 0, vy: 0, drag: false, idle: 0, tx: 0, ty: 0, lastX: 0, lastY: 0 })

  useLayoutEffect(() => {
    const g = outer.current!
    deviceGroups[id] = g
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) { o.castShadow = true }
    })
    return () => { delete deviceGroups[id] }
  }, [id])

  useFrame((_, dt) => {
    const U = u.current
    const st = useStore.getState()
    if (!U.drag) {
      U.y += U.vy
      U.x += U.vx
      U.vy *= 0.93
      U.vx *= 0.93
      U.idle += dt
      if (U.idle > 2.2 && st.activeSection !== S.lab) {
        U.y = damp(U.y, Math.round(U.y / TAU) * TAU, 1.5, dt)
        U.x = damp(U.x, 0, 1.5, dt)
      }
    }
    // mouse-controlled tilt with inertia (strongest in the hero)
    const amt = st.activeSection === S.awakening ? 1 : st.activeSection === S.lab ? 0.35 : 0.55
    const k = pointer.coarse ? 0 : amt
    U.tx = damp(U.tx, pointer.x * 0.38 * k, 2.6, dt)
    U.ty = damp(U.ty, -pointer.y * 0.2 * k, 2.6, dt)
    if (spin.current) spin.current.rotation.set(U.x + U.ty, U.y + U.tx, 0)
  })

  const active = () => {
    const g = outer.current
    return !!g && g.visible && g.scale.x > 0.25
  }

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (!active()) return
    const U = u.current
    U.drag = true
    U.vx = U.vy = 0
    U.idle = 0
    U.lastX = e.clientX
    U.lastY = e.clientY
    useStore.getState().set({ cursorLabel: 'DRAG' })
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - U.lastX
      const dy = ev.clientY - U.lastY
      U.lastX = ev.clientX
      U.lastY = ev.clientY
      U.y += dx * 0.011
      U.x += dy * 0.008
      U.vy = dx * 0.0035
      U.vx = dy * 0.0025
      U.idle = 0
    }
    const up = () => {
      U.drag = false
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const labelFor = () => {
    const s = useStore.getState().activeSection
    return s === S.ecosystem ? 'VIEW' : s === S.connected ? 'LINK' : 'DRAG'
  }

  return (
    <group
      ref={outer}
      onPointerOver={(e) => {
        if (!active()) return
        e.stopPropagation()
        useStore.getState().set({ hovered: id, cursorLabel: labelFor() })
      }}
      onPointerOut={() => {
        const st = useStore.getState()
        if (st.hovered === id) st.set({ hovered: null, cursorLabel: null })
      }}
      onPointerDown={onDown}
      onClick={(e) => {
        if (!active() || e.delta > 6) return
        const st = useStore.getState()
        if (st.activeSection === S.ecosystem) { e.stopPropagation(); st.set({ focus: st.focus === id ? null : id }) }
        else if (st.activeSection === S.connected) { e.stopPropagation(); st.set({ connSel: st.connSel === id ? null : id }) }
      }}
    >
      <group ref={spin}>{children}</group>
    </group>
  )
}

export function Devices() {
  const parts: Record<ProductId, ReactNode> = {
    phone: <Phone />,
    watch: <Watch />,
    buds: <Buds />,
    headphones: <Headphones />,
    pod: <Pod />,
  }
  return (
    <>
      {PRODUCT_IDS.map((id) => (
        <DeviceRig key={id} id={id}>{parts[id]}</DeviceRig>
      ))}
    </>
  )
}
