import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PRODUCT_IDS, S, type ProductId } from '../data/products'
import { useStore } from '../store/useStore'
import { scrollModel, updateScroll } from '../lib/scroll'
import { damp, easeOut, flags, lerp, rig, smoothstep } from '../lib/rig'
import { pointer } from '../lib/pointer'
import { sound } from '../lib/audio'
import { updateMaterials } from './materials'
import { deviceGroups } from './Devices'

type V3 = [number, number, number]
interface Dev { p: V3; r: V3; s: number }
interface Pose { cam: V3; look: V3; dev: Partial<Record<ProductId, Dev>> }
interface Ctx { t: number; aspect: number; wide: boolean; portrait: boolean; st: ReturnType<typeof useStore.getState> }

const TAU = Math.PI * 2
const wrap = (a: number) => a - TAU * Math.round(a / TAU)
const mixV = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
const TAN = Math.tan((35 / 2) * (Math.PI / 180))

/** Pan the whole framing so the subject sits right (+) or left (-) of screen centre, by a fraction of viewport width. */
function pan(pose: Pose, frac: number, c: Ctx) {
  if (!c.wide) return
  const d = Math.hypot(pose.cam[0] - pose.look[0], pose.cam[1] - pose.look[1], pose.cam[2] - pose.look[2])
  const dx = frac * 2 * d * TAN * c.aspect
  pose.cam[0] -= dx
  pose.look[0] -= dx
}

const BASE_SCALE: Record<ProductId, number> = { phone: 1, watch: 0.62, buds: 1, headphones: 0.95, pod: 0.95 }
const ROW_X: Record<ProductId, number> = { phone: -4.8, watch: -2.4, buds: 0, headphones: 2.4, pod: 4.8 }
const ROW_Y: Record<ProductId, number> = { phone: 0, watch: 0, buds: -0.05, headphones: 0.1, pod: 0.25 }
const FOCUS_D: Record<ProductId, number> = { phone: 4.6, watch: 5.4, buds: 3.4, headphones: 4.6, pod: 4.6 }
const LAB_D: Record<ProductId, number> = { phone: 6.2, watch: 6.8, buds: 3.6, headphones: 5.8, pod: 5.4 }
const LAB_S: Record<ProductId, number> = { phone: 1.15, watch: 0.8, buds: 1.55, headphones: 1.2, pod: 1.15 }

const dev = (p: V3, r: V3, s: number): Dev => ({ p, r, s })

/* ------------------------------------------------------------------ layouts */
function layout(i: number, p: number, c: Ctx): Pose {
  const { t, st } = c
  const bob = (ph: number, a = 0.06) => Math.sin(t * 0.8 + ph) * a
  switch (i) {
    /* 01 — THE AWAKENING */
    case S.awakening: {
      const intro = easeOut(rig.intro)
      const a = p * 0.95
      const dist = 6.4 + (1 - intro) * 2.8
      const rotY = (1 - intro) * -2.4 + Math.sin(t * 0.35) * 0.5 + p * 3.0
      return {
        cam: [Math.sin(a) * dist, 0.12 + p * 0.5, Math.cos(a) * dist],
        look: [0, c.portrait ? -0.75 : c.wide ? -0.5 : -0.3, 0],
        dev: { phone: dev([0, bob(0, 0.08) - 0.05, 0], [0.04, rotY, 0], (0.85 + intro * 0.45)) },
      }
    }
    /* 02 — ENGINEERED TO PERFECTION */
    case S.engineering: {
      const e = smoothstep(0.14, 0.86, p)
      return {
        cam: [lerp(0.4, 3.9, e), lerp(0.25, 1.1, e), lerp(5.6, 7.0, e)],
        look: [0, 0, lerp(0, -0.05, e)],
        dev: { phone: dev([0, bob(1, 0.03), 0], [0.08, lerp(-0.2, -0.78, smoothstep(0, 0.3, p)), 0], 0.95) },
      }
    }
    /* 03 — ECOSYSTEM */
    case S.ecosystem: {
      const f = st.focus
      const devs: Pose['dev'] = {}
      PRODUCT_IDS.forEach((id, n) => {
        const focused = f === id
        const hov = st.hovered === id && !f
        devs[id] = dev(
          [ROW_X[id], ROW_Y[id] + bob(n * 1.3, 0.1) + (focused ? 0.1 : hov ? 0.15 : 0), focused ? 0.8 : 0],
          [0.12, t * 0.35 + n * 1.7 + (focused ? Math.sin(t * 0.5) * 0.3 : 0), 0],
          BASE_SCALE[id] * (focused ? 1.18 : hov ? 1.1 : 1) * (f && !focused ? 0.82 : 1),
        )
      })
      const visW = 2 * 10.5 * TAN * c.aspect
      const half = Math.max(0, 5.9 - visW / 2)
      const panX = lerp(-half, half, p) * 0.85
      let pose: Pose
      if (f) {
        const d = FOCUS_D[f]
        pose = { cam: [ROW_X[f] + 0.5, 0.5, d + 0.8], look: [ROW_X[f], ROW_Y[f] * 0.5, 0.8], dev: devs }
        pan(pose, -0.16, c)
        if (c.portrait) pose.look[1] -= 0.55
      } else {
        pose = { cam: [panX, 0.7, 10.5], look: [panX, 0, 0], dev: devs }
      }
      return pose
    }
    /* 04 — SMARTPHONE */
    case S.phone: {
      const ex = st.phoneExplode
      const spinBack = smoothstep(0.34, 0.5, p) * Math.PI
      const ret = smoothstep(0.72, 0.98, p) * Math.PI
      const rotY = ex ? -0.7 : spinBack + ret + Math.sin(t * 0.4) * 0.05
      const shotFront = smoothstep(0.1, 0.22, p) * (1 - smoothstep(0.3, 0.42, p))
      const shotLens = smoothstep(0.5, 0.62, p) * (1 - smoothstep(0.66, 0.78, p))
      let cam: V3 = [0, 0.15, 6]
      let look: V3 = [0, 0, 0]
      cam = mixV(cam, [0.05, 0.25, 3.1], shotFront)
      look = mixV(look, [0, 0.1, 0], shotFront)
      cam = mixV(cam, [-0.2, 0.68, 1.75], shotLens)
      look = mixV(look, [-0.17, 0.52, 0.1], shotLens)
      if (ex) { cam = [3.2, 0.9, 8]; look = [0, 0, -0.1] }
      const pose: Pose = { cam, look, dev: { phone: dev([0, bob(2, 0.04) * (1 - shotLens), 0], [ex ? 0.1 : 0.02, rotY, 0], 1) } }
      if (!ex && shotLens < 0.5 && shotFront < 0.5) pan(pose, 0.14, c)
      return pose
    }
    /* 05 — WATCH */
    case S.watch: {
      const zoom = st.watchZoom ? 1 : flags.watchTouched ? 0 : smoothstep(0.62, 0.8, p) * (1 - smoothstep(0.92, 1, p))
      const z = st.watchZoom || !flags.watchTouched ? zoom : 0
      const spinAmt = 1 - smoothstep(0.16, 0.34, p)
      const rotY = spinAmt * (t * 0.6 + 0.6) + Math.sin(t * 0.5) * 0.18 * (1 - z)
      let cam: V3 = [0.2, 0.2, 6.6]
      let look: V3 = [0, 0, 0]
      cam = mixV(cam, [0, 0.1, 2.25], z)
      look = mixV(look, [0, 0.0, 0.12], z)
      const pose: Pose = { cam, look, dev: { watch: dev([0, bob(3, 0.05), 0], [0.05 * (1 - z), rotY * (1 - z * 0.9), 0], lerp(0.95, 1.0, z)) } }
      if (z < 0.5) pan(pose, 0.15, c)
      return pose
    }
    /* 06 — AUDIO */
    case S.audio: {
      const portrait = c.portrait
      const drift = lerp(-0.6, 0.6, p)
      const b: V3 = portrait ? [0, -1.7, 0] : [-1.55, -0.85, 0]
      const h: V3 = portrait ? [0, 1.45, 0] : [1.95, 0.05, 0]
      return {
        cam: [portrait ? 0 : drift, 0.5, portrait ? 8.6 : 7.4],
        look: [0, portrait ? -0.1 : 0, 0],
        dev: {
          buds: dev([b[0], b[1] + bob(4, 0.07), b[2]], [0.45, t * 0.28 + 0.5, 0.02], portrait ? 1.5 : 1.4),
          headphones: dev([h[0], h[1] + bob(5, 0.07), h[2]], [0.05, t * 0.42, 0], portrait ? 1.0 : 1.3),
        },
      }
    }
    /* 07 — LAB */
    case S.lab: {
      const id = st.labProduct
      const d = lerp(LAB_D[id] * 1.15, LAB_D[id] * 0.42, st.labZoom)
      const pose: Pose = {
        cam: [0, 0.35 + st.labZoom * 0.2, d],
        look: [0, 0, 0],
        dev: { [id]: dev([0, bob(6, 0.04), 0], [0.16, t * 0.25 + 0.4, 0], LAB_S[id]) },
      }
      pan(pose, 0.13, c)
      if (c.portrait) pose.look[1] -= 0.5
      return pose
    }
    /* 08 — CONNECTED */
    case S.connected: {
      const sel = st.connSel
      const orb = (r: number, ph: number, sp: number, y: number): V3 => {
        const a = t * sp + ph
        return [Math.cos(a) * r, y + Math.sin(a * 1.3) * 0.35, Math.sin(a) * r * 0.8]
      }
      const sc = (id: ProductId, base: number) => base * (sel === id ? 1.28 : 1)
      const a = lerp(-0.3, 0.3, p)
      const R = 9.4
      return {
        cam: [Math.sin(a) * R, 1.8, Math.cos(a) * R],
        look: [0, 0.1, 0],
        dev: {
          phone: dev([0, bob(7, 0.08), 0], [0.05, t * 0.3, 0], sc('phone', 1.25)),
          watch: dev(orb(2.7, 0, 0.45, 0.2), [0.3, t * 0.5, 0.2], sc('watch', 0.7)),
          buds: dev(orb(3.5, 2.1, 0.3, 1.0), [0.3, t * 0.4, 0], sc('buds', 1.1)),
          headphones: dev(orb(4.1, 4.2, 0.22, -0.8), [0.1, t * 0.3 + 1, 0], sc('headphones', 0.95)),
          pod: dev(orb(3.1, 5.3, 0.36, -1.5), [0, t * 0.4, 0], sc('pod', 0.95)),
        },
      }
    }
    /* 09 — FINAL TRANSMISSION */
    default: {
      const back = easeOut(p)
      const f = (x: number, y: number, z: number): V3 => [x, y + Math.sin(t * 0.7 + x) * 0.07, z]
      return {
        cam: [0, lerp(0.3, 2.2, back), lerp(6.4, 19.5, back)],
        look: [0, lerp(0, 0.9, back), -1],
        dev: {
          phone: dev(f(0, 0, 0), [0.05, Math.sin(t * 0.4) * 0.5, 0], 1.35),
          watch: dev(f(2.3, -0.5, 0.6), [0.1, -0.5 + Math.sin(t * 0.5) * 0.3, 0.1], 0.75),
          buds: dev(f(-1.5, -0.9, 1.0), [0.5, t * 0.3, 0], 1.3),
          headphones: dev(f(-2.8, 0.2, -0.2), [0.1, 0.5 + Math.sin(t * 0.4) * 0.25, 0], 1.15),
          pod: dev(f(1.9, 0.75, -0.9), [0, t * 0.3, 0], 1.0),
        },
      }
    }
  }
}

/* ------------------------------------------------------------------ rig targets (per dominant section) */
function rigTargets(sec: number, p: number, st: ReturnType<typeof useStore.getState>) {
  let explode = 0, strap = 0, watchOn = 1, caseOpen = 0, budsOut = 0
  if (sec === S.engineering) explode = smoothstep(0.14, 0.86, p)
  if (sec === S.phone) explode = st.phoneExplode ? 1 : 0
  if (sec === S.watch) {
    strap = flags.watchTouched ? (st.strapOff ? 1 : 0) : smoothstep(0.2, 0.38, p) * (1 - smoothstep(0.74, 0.9, p))
    watchOn = smoothstep(0.08, 0.2, p)
  }
  if (sec === S.audio) {
    caseOpen = flags.audioTouched ? (st.caseOpen ? 1 : 0) : smoothstep(0.12, 0.26, p)
    budsOut = flags.audioTouched ? (st.budsOut ? 1 : 0) : smoothstep(0.34, 0.58, p)
  }
  return { explode, strap, watchOn, caseOpen, budsOut }
}

/* ------------------------------------------------------------------ director */
const camPos = new THREE.Vector3(0, 0.1, 9)
const camLook = new THREE.Vector3()
const init: Record<string, { p: V3; r: V3; s: number }> = {}
let prevSection = -1

export function Director() {
  const { camera, scene, size } = useThree()
  const hiddenInit = useRef(false)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const st = useStore.getState()
    rig.time += dt
    const t = rig.time
    updateScroll(window.scrollY)
    const m = scrollModel
    const aspect = size.width / size.height
    const c: Ctx = { t, aspect, wide: aspect > 1.2, portrait: aspect < 0.85, st }
    const fast = st.reduced ? 2.2 : 1

    // active section bookkeeping
    const dominant = m.k > 0.5 ? m.index + 1 : m.index
    if (dominant !== st.activeSection) st.set({ activeSection: dominant })
    if (dominant !== prevSection) {
      if (prevSection === S.watch) { flags.watchTouched = false }
      if (prevSection === S.audio) { flags.audioTouched = false }
      if (prevSection === S.ecosystem && dominant !== S.ecosystem) st.set({ focus: null })
      if (prevSection === S.phone) st.set({ phoneExplode: false, phoneHotspot: null })
      if (prevSection === S.watch) st.set({ strapOff: false, watchZoom: false, watchHotspot: null })
      prevSection = dominant
    }

    // section weights (drive backdrops)
    for (let i = 0; i < rig.w.length; i++) rig.w[i] = i === m.index ? 1 - m.k : i === m.index + 1 ? m.k : 0

    // watch face auto-cycle (until the visitor takes over)
    if (m.index === S.watch && !flags.watchTouched && m.k < 0.5) {
      const auto = m.p < 0.38 ? 0 : Math.min(3, Math.floor((m.p - 0.38) / 0.15))
      if (auto !== st.watchFace) st.set({ watchFace: auto })
    }

    // rig targets
    const tg = rigTargets(dominant, dominant === m.index ? m.p : 0, st)
    rig.explode = damp(rig.explode, tg.explode, 3.2 * fast, dt)
    rig.strap = damp(rig.strap, tg.strap, 3.2 * fast, dt)
    rig.watchOn = damp(rig.watchOn, tg.watchOn, 4, dt)
    rig.caseOpen = damp(rig.caseOpen, tg.caseOpen, 3.5, dt)
    rig.budsOut = damp(rig.budsOut, tg.budsOut, 2.6, dt)
    const zoomT = dominant === S.watch ? (st.watchZoom ? 1 : flags.watchTouched ? 0 : smoothstep(0.62, 0.8, m.p) * (1 - smoothstep(0.92, 1, m.p))) : 0
    rig.zoom = damp(rig.zoom, zoomT, 4, dt)
    rig.screenOn = damp(rig.screenOn, 1, 3, dt)

    // audio-reactive pulse
    const live = sound.level()
    const synth = 0.18 + 0.12 * Math.sin(t * 3.2) * Math.sin(t * 0.7)
    rig.pulse = damp(rig.pulse, sound.on ? live : synth * (rig.w[S.audio] + 0.3), 8, dt)

    // blended pose
    const A = layout(m.index, m.index === dominant ? m.p : 1, c)
    const B = m.k > 0.001 && m.index < 8 ? layout(m.index + 1, 0, c) : null
    const k = B ? m.k : 0
    const cam = B ? mixV(A.cam, B.cam, k) : A.cam
    const look = B ? mixV(A.look, B.look, k) : A.look

    // camera (portrait gets a wider lens + extra distance)
    const fov = c.portrait ? 40 : 35
    const persp = camera as THREE.PerspectiveCamera
    if (persp.fov !== fov) { persp.fov = fov; persp.updateProjectionMatrix() }
    const fit = c.portrait ? Math.min(1.9, 1 + (1 / aspect - 1.2) * 0.42) : aspect < 1.2 ? 1.2 : 1
    const dx = cam[0] - look[0], dy = cam[1] - look[1], dz = cam[2] - look[2]
    const tx = look[0] + dx * fit
    const ty = look[1] + dy * fit
    const tz = look[2] + dz * fit
    const lam = 2.6 * fast
    if (!hiddenInit.current) { camPos.set(tx, ty, tz); camLook.set(look[0], look[1], look[2]); hiddenInit.current = true }
    camPos.x = damp(camPos.x, tx, lam, dt)
    camPos.y = damp(camPos.y, ty, lam, dt)
    camPos.z = damp(camPos.z, tz, lam, dt)
    camLook.x = damp(camLook.x, look[0], lam * 1.2, dt)
    camLook.y = damp(camLook.y, look[1], lam * 1.2, dt)
    camLook.z = damp(camLook.z, look[2], lam * 1.2, dt)
    const par = st.reduced || pointer.coarse ? 0 : 1
    camera.position.set(
      camPos.x + pointer.x * 0.28 * par + Math.sin(t * 0.23) * 0.06 * (st.reduced ? 0 : 1),
      camPos.y + pointer.y * 0.16 * par + Math.cos(t * 0.31) * 0.04 * (st.reduced ? 0 : 1),
      camPos.z,
    )
    camera.lookAt(camLook)

    // devices
    for (const id of PRODUCT_IDS) {
      const g = deviceGroups[id]
      if (!g) continue
      const da = A.dev[id]
      const db = B?.dev[id]
      let target: Dev | null = null
      if (da && db) target = { p: mixV(da.p, db.p, k), r: [lerp(da.r[0], db.r[0], k), da.r[1] + wrap(db.r[1] - da.r[1]) * k, lerp(da.r[2], db.r[2], k)], s: lerp(da.s, db.s, k) }
      else if (da) target = { ...da, s: da.s * (1 - k) }
      else if (db) target = { ...db, s: db.s * k }
      let s = init[id]
      if (!s) {
        s = init[id] = { p: target ? [...target.p] : [0, 0, 0], r: target ? [...target.r] : [0, 0, 0], s: 0 }
      }
      if (target) {
        const lp = (id === 'watch' && dominant === S.watch ? 3.2 : 3.6) * fast
        for (let n = 0; n < 3; n++) {
          s.p[n] = damp(s.p[n], target.p[n], lp, dt)
          s.r[n] = n === 1 ? s.r[n] + wrap(target.r[n] - s.r[n]) * (1 - Math.exp(-lp * dt)) : damp(s.r[n], target.r[n], lp, dt)
        }
        s.s = damp(s.s, target.s, 4.5 * fast, dt)
      } else {
        s.s = damp(s.s, 0, 6 * fast, dt)
      }
      g.position.set(s.p[0], s.p[1], s.p[2])
      g.rotation.set(s.r[0], s.r[1], s.r[2])
      g.scale.setScalar(Math.max(0.0001, s.s))
      g.visible = s.s > 0.012
    }

    updateMaterials(dt)
    // sweeping reflections across the metal: rotate the environment slowly with time + scroll
    scene.environmentRotation.y = t * 0.12 + m.y * 0.0006
  }, -1)

  return null
}
