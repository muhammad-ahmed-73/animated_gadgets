import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { LINKS, PRODUCT_IDS, S, type ProductId } from '../data/products'
import { useStore } from '../store/useStore'
import { clamp01, easeOut, rig } from '../lib/rig'
import { scrollModel } from '../lib/scroll'
import { deviceGroups } from './Devices'
import { makeSparkTexture } from './textures'

const BLUE = new THREE.Color('#426BFF')
const CYAN = new THREE.Color('#55E6FF')

const wmax = (...idx: number[]) => Math.max(...idx.map((i) => rig.w[i]))

/* =========================================================================== particles */
const PARTICLE_VERT = /* glsl */ `
attribute vec3 aRand;
uniform float uTime, uPulse, uPx, uSpeed;
varying float vA;
varying vec3 vC;
void main(){
  vec3 p = position;
  float t = uTime * uSpeed * (0.35 + aRand.x * 0.65);
  p.y = mod(p.y + t * 0.5 * (0.4 + aRand.y) + 10.0, 20.0) - 10.0;
  p.x += sin(t * 0.7 + aRand.z * 40.0) * 0.45;
  p.z += cos(t * 0.5 + aRand.x * 30.0) * 0.45;
  p += normalize(p + 0.001) * uPulse * 0.7 * sin(aRand.y * 50.0 + uTime * 6.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  float size = (0.5 + aRand.z * 1.5) * (1.0 + uPulse * 1.4);
  gl_PointSize = clamp(size * uPx * (26.0 / depth), 1.0, 14.0 * uPx);
  vA = (0.25 + aRand.y * 0.75) * smoothstep(60.0, 8.0, depth) * smoothstep(0.5, 2.5, depth);
  vC = mix(vec3(0.33, 0.9, 1.0), vec3(0.26, 0.42, 1.0), aRand.x);
  if (aRand.z > 0.9) vC = vec3(1.0);
}`
const PARTICLE_FRAG = /* glsl */ `
varying float vA; varying vec3 vC;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vC * (1.0 + a), a * a * vA);
}`

export function Particles() {
  const quality = useStore((s) => s.quality)
  const reduced = useStore((s) => s.reduced)
  const count = quality === 'low' ? 650 : 2200
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const rnd = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 2
      rnd[i * 3] = Math.random(); rnd[i * 3 + 1] = Math.random(); rnd[i * 3 + 2] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 3))
    const m = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPulse: { value: 0 }, uPx: { value: 1 }, uSpeed: { value: 1 } },
    })
    return { geo: g, mat: m }
  }, [count])
  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])
  useFrame(({ gl }) => {
    const u = mat.uniforms
    u.uTime.value = rig.time
    u.uPulse.value = rig.pulse * 0.6 * rig.w[S.audio] + rig.pulse * 0.15
    u.uPx.value = gl.getPixelRatio()
    u.uSpeed.value = (reduced ? 0.15 : 1) * (1 + Math.min(4, Math.abs(scrollModel.vel) * 40))
  })
  return <points geometry={geo} material={mat} frustumCulled={false} />
}

/* =========================================================================== floor */
export function Floor() {
  const quality = useStore((s) => s.quality)
  const mesh = useRef<THREE.Mesh>(null)
  const refl = useRef<{ opacity: number; transparent: boolean } | null>(null)
  const shadow = useRef<THREE.ShadowMaterial>(null)
  useFrame(() => {
    const w = wmax(S.awakening, S.ecosystem, S.lab, S.finale)
    if (mesh.current) mesh.current.visible = w > 0.01
    if (refl.current) refl.current.opacity = w
    if (shadow.current) shadow.current.opacity = 0.5 * w
  })
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} receiveShadow>
      <planeGeometry args={[70, 70]} />
      {quality === 'high' ? (
        <MeshReflectorMaterial
          ref={refl as never}
          transparent
          resolution={512}
          blur={[360, 90]}
          mixBlur={1}
          mixStrength={1.6}
          mixContrast={1.1}
          mirror={0.6}
          roughness={0.85}
          metalness={0.5}
          depthScale={1.2}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.5}
          color="#0a0c10"
        />
      ) : (
        <shadowMaterial ref={shadow} transparent opacity={0.4} />
      )}
    </mesh>
  )
}

/* =========================================================================== hero: beams + energy field */
const BEAM_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`
const BEAM_FRAG = /* glsl */ `
uniform float uTime, uFade; uniform vec3 uC1, uC2;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  float f = abs(dot(normalize(vN), normalize(vV)));
  float core = pow(f, 2.2);
  float h = vUv.y;
  float fade = smoothstep(0.0, 0.25, h) * (1.0 - smoothstep(0.55, 1.0, h));
  float flick = 0.85 + 0.15 * sin(uTime * 0.9 + h * 7.0);
  vec3 col = mix(uC1, uC2, h);
  gl_FragColor = vec4(col * 1.4, core * fade * flick * 0.34 * uFade);
}`

function Beam({ position, rotation, color = 0 }: { position: V3; rotation: V3; color?: number }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: BEAM_VERT, fragmentShader: BEAM_FRAG, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uFade: { value: 0 }, uC1: { value: color ? CYAN : BLUE }, uC2: { value: color ? BLUE : CYAN } },
  }), [color])
  useEffect(() => () => mat.dispose(), [mat])
  useFrame(() => {
    mat.uniforms.uTime.value = rig.time
    mat.uniforms.uFade.value = rig.w[S.awakening] * clamp01(rig.intro * 1.4) + rig.w[S.finale] * 0.5
  })
  return (
    <mesh position={position} rotation={rotation} material={mat} frustumCulled={false}>
      <cylinderGeometry args={[0.05, 1.5, 16, 40, 1, true]} />
    </mesh>
  )
}

type V3 = [number, number, number]

const POLAR_FRAG = /* glsl */ `
uniform float uTime, uFade, uTicks, uSpeed; uniform vec3 uColor;
varying vec2 vUv;
float ln(float x, float w){ return smoothstep(w, 0.0, abs(x)); }
void main(){
  vec2 uv = vUv * 2.0 - 1.0;
  float r = length(uv);
  float a = atan(uv.y, uv.x) + uTime * uSpeed;
  float c = 0.0;
  c += ln(r - 0.97, 0.006) * 0.9;
  c += ln(r - 0.74, 0.004) * 0.45;
  c += ln(r - 0.42, 0.004) * 0.3;
  float seg = 6.2831853 / uTicks;
  float tk = fract(a / seg);
  float tick = 1.0 - smoothstep(0.0, 0.07, min(tk, 1.0 - tk));
  float big = step(0.5, fract(a / (seg * 5.0) + 0.001)) ;
  c += tick * step(0.88, r) * step(r, 0.955) * 0.75;
  c += tick * step(0.84, r) * step(r, 0.96) * (1.0 - step(0.12, min(fract(a / (seg * 5.0)), 1.0 - fract(a / (seg * 5.0))))) * 0.9;
  float arc = step(0.2, sin(a * 3.0 + 1.0));
  c += ln(r - 0.83, 0.007) * arc * 0.9;
  float arc2 = step(0.5, sin(a * 2.0 - uTime * 0.4));
  c += ln(r - 0.58, 0.005) * arc2 * 0.6;
  c *= 1.0 - smoothstep(0.96, 1.0, r);
  c += big * 0.0;
  gl_FragColor = vec4(uColor * 1.6, c * uFade * 0.8);
}`

export function PolarGrid({
  position, rotation = [0, 0, 0], size, ticks = 120, speed = 0.05, color = BLUE, weight,
}: { position: V3; rotation?: V3; size: number; ticks?: number; speed?: number; color?: THREE.Color; weight: () => number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: POLAR_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uFade: { value: 0 }, uTicks: { value: ticks }, uSpeed: { value: speed }, uColor: { value: color } },
  }), [ticks, speed, color])
  useEffect(() => () => mat.dispose(), [mat])
  useFrame(() => {
    const w = weight()
    mat.uniforms.uFade.value = w
    mat.uniforms.uTime.value = rig.time
    if (mesh.current) mesh.current.visible = w > 0.01
  })
  return (
    <mesh ref={mesh} position={position} rotation={rotation} material={mat} frustumCulled={false}>
      <planeGeometry args={[size, size]} />
    </mesh>
  )
}

const FIELD_FRAG = /* glsl */ `
uniform float uTime, uFade, uPulse;
varying vec2 vUv;
void main(){
  vec2 uv = vUv * 2.0 - 1.0;
  float r = length(uv);
  float wave = 0.5 + 0.5 * sin(r * 34.0 - uTime * 2.4);
  float pulses = pow(wave, 7.0);
  float fall = pow(1.0 - clamp(r, 0.0, 1.0), 1.7);
  float base = fall * 0.22;
  float rim = smoothstep(0.03, 0.0, abs(r - 0.96)) * 0.9;
  float a = (base + pulses * fall * (0.5 + uPulse)) + rim;
  vec3 col = mix(vec3(0.26, 0.42, 1.0), vec3(0.33, 0.9, 1.0), pulses + rim);
  gl_FragColor = vec4(col * 1.5, a * uFade * smoothstep(1.0, 0.9, r));
}`

function EnergyField() {
  const group = useRef<THREE.Group>(null)
  const halo = useRef<THREE.Mesh>(null)
  const halo2 = useRef<THREE.Mesh>(null)
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: FIELD_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uFade: { value: 0 }, uPulse: { value: 0 } },
  }), [])
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ color: CYAN.clone().multiplyScalar(2), toneMapped: false, transparent: true }), [])
  const glow2 = useMemo(() => new THREE.MeshBasicMaterial({ color: BLUE.clone().multiplyScalar(2.4), toneMapped: false, transparent: true }), [])
  useEffect(() => () => { mat.dispose(); glow.dispose(); glow2.dispose() }, [mat, glow, glow2])
  useFrame(() => {
    const w = rig.w[S.awakening] * clamp01(rig.intro * 1.3)
    mat.uniforms.uFade.value = w
    mat.uniforms.uTime.value = rig.time
    mat.uniforms.uPulse.value = rig.pulse
    glow.opacity = w
    glow2.opacity = w
    if (group.current) group.current.visible = w > 0.01
    if (halo.current) { halo.current.rotation.z = rig.time * 0.12; halo.current.rotation.x = Math.sin(rig.time * 0.3) * 0.2 }
    if (halo2.current) { halo2.current.rotation.z = -rig.time * 0.2; halo2.current.rotation.y = 0.6 + Math.sin(rig.time * 0.25) * 0.2 }
  })
  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]} material={mat}>
        <planeGeometry args={[11, 11]} />
      </mesh>
      <mesh ref={halo} position={[0, 0, -1.4]} material={glow}>
        <torusGeometry args={[2.35, 0.012, 12, 160]} />
      </mesh>
      <mesh ref={halo2} position={[0, 0, -1.6]} material={glow2}>
        <torusGeometry args={[2.9, 0.008, 12, 160, Math.PI * 1.35]} />
      </mesh>
    </group>
  )
}

export function HeroField() {
  return (
    <>
      <Beam position={[-3.4, 3, -4]} rotation={[0, 0, 0.42]} />
      <Beam position={[3.8, 3.4, -5]} rotation={[0, 0, -0.5]} color={1} />
      <Beam position={[0, 4.4, -6.5]} rotation={[0, 0, 0.04]} />
      <EnergyField />
    </>
  )
}

/* =========================================================================== showroom */
export const ROW: Record<ProductId, number> = { phone: -4.8, watch: -2.4, buds: 0, headphones: 2.4, pod: 4.8 }

export function Showroom() {
  const group = useRef<THREE.Group>(null)
  const rings = useRef<Record<string, THREE.MeshBasicMaterial>>({})
  const slits = useRef<THREE.MeshBasicMaterial[]>([])
  const ringGeo = useMemo(() => new THREE.RingGeometry(0.86, 0.9, 72), [])
  const discGeo = useMemo(() => new THREE.CylinderGeometry(0.85, 0.92, 0.07, 64), [])
  useEffect(() => () => { ringGeo.dispose(); discGeo.dispose() }, [ringGeo, discGeo])
  useFrame(() => {
    const w = rig.w[S.ecosystem]
    const st = useStore.getState()
    if (group.current) {
      group.current.visible = w > 0.01
      const s = easeOut(w)
      group.current.scale.set(s, s, s)
    }
    for (const id of PRODUCT_IDS) {
      const m = rings.current[id]
      if (!m) continue
      const on = st.focus === id || (!st.focus && st.hovered === id)
      const k = on ? 3.2 : 0.9
      m.color.setRGB(0.26 * k, 0.55 * k, 1.0 * k)
    }
    for (const m of slits.current) m.opacity = w * 0.25
  })
  return (
    <group ref={group}>
      {PRODUCT_IDS.map((id) => (
        <group key={id} position={[ROW[id], -1.6, 0]}>
          <mesh geometry={discGeo}>
            <meshStandardMaterial color="#0e1116" metalness={0.9} roughness={0.28} />
          </mesh>
          <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
            <meshBasicMaterial ref={(m) => { if (m) rings.current[id] = m }} color="#426BFF" toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 13 }).map((_, i) => (
        <mesh key={i} position={[(i - 6) * 2.2, 2, -7.5]}>
          <planeGeometry args={[0.035, 11]} />
          <meshBasicMaterial ref={(m) => { if (m) slits.current[i] = m }} color="#426BFF" transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* =========================================================================== audio: sound waves */
export function SoundWaves() {
  const meshes = useRef<THREE.Mesh[]>([])
  const mats = useRef<THREE.MeshBasicMaterial[]>([])
  const RINGS = 6
  const geo = useMemo(() => new THREE.RingGeometry(0.985, 1, 128), [])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame(() => {
    const w = rig.w[S.audio]
    const emit: (THREE.Group | undefined)[] = [deviceGroups.buds, deviceGroups.headphones]
    for (let e = 0; e < 2; e++) {
      const src = emit[e]
      for (let i = 0; i < RINGS; i++) {
        const idx = e * RINGS + i
        const m = meshes.current[idx]
        const mat = mats.current[idx]
        if (!m || !mat) continue
        m.visible = w > 0.01 && !!src
        if (!src) continue
        const ph = (rig.time * (0.22 + rig.pulse * 0.2) + i / RINGS + e * 0.37) % 1
        m.position.copy(src.position)
        m.position.z -= 0.2
        const sc = 0.4 + ph * 5.2
        m.scale.set(sc, sc, sc)
        mat.opacity = Math.pow(1 - ph, 1.6) * w * (0.35 + rig.pulse * 1.1)
      }
    }
  })
  return (
    <group>
      {Array.from({ length: RINGS * 2 }).map((_, i) => (
        <mesh key={i} ref={(m) => { if (m) meshes.current[i] = m }} geometry={geo} frustumCulled={false}>
          <meshBasicMaterial
            ref={(m) => { if (m) mats.current[i] = m }}
            color={i < RINGS ? '#55E6FF' : '#426BFF'} transparent opacity={0} depthWrite={false}
            blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

/* =========================================================================== lab scanner */
export function LabScanner() {
  const ring = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(() => {
    const w = rig.w[S.lab]
    const id = useStore.getState().labProduct
    const g = deviceGroups[id]
    if (ring.current) {
      ring.current.visible = w > 0.01
      const y = Math.sin(rig.time * 0.8) * 1.15
      ring.current.position.set(0, y, 0)
      const s = (g ? g.scale.x : 1) * 1.15
      ring.current.scale.set(s, s, s)
    }
    if (mat.current) mat.current.opacity = w * 0.9
  })
  return (
    <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.5, 0.006, 8, 160]} />
      <meshBasicMaterial ref={mat} color={[0.4, 2.0, 2.4]} toneMapped={false} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

/* =========================================================================== network */
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _m = new THREE.Vector3()
const _curve = new THREE.QuadraticBezierCurve3()

export function Network() {
  const SEG = 48
  const PK = 3
  const lines = useRef<THREE.Line[]>([])
  const pts = useRef<THREE.Points>(null)
  const spark = useMemo(() => makeSparkTexture(), [])
  const packetGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LINKS.length * PK * 3), 3))
    return g
  }, [])
  const lineObjs = useMemo(() => LINKS.map(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((SEG + 1) * 3), 3))
    const m = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    return new THREE.Line(g, m)
  }), [])
  useEffect(() => () => {
    lineObjs.forEach((l) => { l.geometry.dispose(); (l.material as THREE.Material).dispose() })
    packetGeo.dispose(); spark.dispose()
  }, [lineObjs, packetGeo, spark])

  useFrame(() => {
    const w = rig.w[S.connected]
    const sel = useStore.getState().connSel
    const pos = packetGeo.attributes.position as THREE.BufferAttribute
    LINKS.forEach(([A, B], li) => {
      const ga = deviceGroups[A], gb = deviceGroups[B]
      const line = lineObjs[li]
      const mat = line.material as THREE.LineBasicMaterial
      const live = w > 0.01 && ga && gb
      line.visible = !!live
      if (!live || !ga || !gb) return
      _a.copy(ga.position)
      _b.copy(gb.position)
      _m.copy(_a).add(_b).multiplyScalar(0.5)
      _m.y += 0.9 + _a.distanceTo(_b) * 0.12
      _curve.v0.copy(_a); _curve.v1.copy(_m); _curve.v2.copy(_b)
      const arr = (line.geometry.attributes.position as THREE.BufferAttribute)
      for (let i = 0; i <= SEG; i++) {
        _curve.getPoint(i / SEG, _a)
        arr.setXYZ(i, _a.x, _a.y, _a.z)
      }
      arr.needsUpdate = true
      const involved = sel && (A === sel || B === sel)
      const target = !sel ? 0.5 : involved ? 1 : 0.1
      mat.opacity += (target * w - mat.opacity) * 0.15
      mat.color.copy(involved ? CYAN : BLUE)
      for (let k = 0; k < PK; k++) {
        const ph = (rig.time * (involved ? 0.5 : 0.28) + k / PK + li * 0.17) % 1
        _curve.getPoint(ph, _a)
        pos.setXYZ(li * PK + k, _a.x, _a.y, _a.z)
      }
    })
    pos.needsUpdate = true
    if (pts.current) {
      pts.current.visible = w > 0.01
      ;(pts.current.material as THREE.PointsMaterial).opacity = w
    }
  })

  return (
    <group>
      {lineObjs.map((l, i) => <primitive key={i} object={l} ref={(o: THREE.Line) => { if (o) lines.current[i] = o }} frustumCulled={false} />)}
      <points ref={pts} geometry={packetGeo} frustumCulled={false}>
        <pointsMaterial map={spark} size={0.45} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} color={[0.5, 1.8, 2.2]} toneMapped={false} />
      </points>
    </group>
  )
}

/* =========================================================================== portal */
const PORTAL_FRAG = /* glsl */ `
uniform float uTime, uFade;
varying vec2 vUv;
void main(){
  vec2 uv = vUv * 2.0 - 1.0;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float swirl = sin(a * 4.0 + r * 10.0 - uTime * 1.2) * 0.5 + 0.5;
  float swirl2 = sin(a * 7.0 - r * 16.0 + uTime * 0.8) * 0.5 + 0.5;
  float core = pow(1.0 - r, 2.2);
  float rings = smoothstep(0.92, 1.0, sin(r * 40.0 - uTime * 2.0) * 0.5 + 0.5) * (1.0 - r);
  vec3 col = mix(vec3(0.05, 0.12, 0.6), vec3(0.33, 0.9, 1.0), swirl * core + swirl2 * 0.25 * (1.0 - r));
  col += rings * 0.6 * vec3(0.4, 0.8, 1.0);
  float alpha = (0.35 + core * 0.9 + swirl * 0.25) * smoothstep(1.0, 0.86, r);
  gl_FragColor = vec4(col * 0.85, alpha * 0.55 * uFade);
}`
const GLOW_FRAG = /* glsl */ `
uniform float uFade; varying vec2 vUv;
void main(){
  float r = length(vUv * 2.0 - 1.0);
  float g = pow(clamp(1.0 - r, 0.0, 1.0), 2.4);
  gl_FragColor = vec4(vec3(0.2, 0.4, 1.0) * 1.6, g * 0.35 * uFade);
}`

export function Portal() {
  const group = useRef<THREE.Group>(null)
  const rim = useRef<THREE.Mesh>(null)
  const rim2 = useRef<THREE.Mesh>(null)
  const vs = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
  const disc = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vs, fragmentShader: PORTAL_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uFade: { value: 0 } },
  }), [vs])
  const glow = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vs, fragmentShader: GLOW_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uFade: { value: 0 } },
  }), [vs])
  const rimMat = useMemo(() => new THREE.MeshBasicMaterial({ color: CYAN.clone().multiplyScalar(2.6), toneMapped: false, transparent: true }), [])
  const rimMat2 = useMemo(() => new THREE.MeshBasicMaterial({ color: BLUE.clone().multiplyScalar(3), toneMapped: false, transparent: true }), [])
  useEffect(() => () => { disc.dispose(); glow.dispose(); rimMat.dispose(); rimMat2.dispose() }, [disc, glow, rimMat, rimMat2])
  useFrame(() => {
    const w = rig.w[S.finale]
    const e = easeOut(w)
    disc.uniforms.uTime.value = rig.time
    disc.uniforms.uFade.value = e
    glow.uniforms.uFade.value = e
    rimMat.opacity = e
    rimMat2.opacity = e
    if (group.current) { group.current.visible = w > 0.01; const s = 0.4 + e * 0.6; group.current.scale.set(s, s, s) }
    if (rim.current) rim.current.rotation.z = rig.time * 0.25
    if (rim2.current) rim2.current.rotation.z = -rig.time * 0.4
  })
  return (
    <group ref={group} position={[0, 0.6, -8]}>
      <mesh material={glow}><planeGeometry args={[22, 22]} /></mesh>
      <mesh material={disc} position={[0, 0, 0.01]}><planeGeometry args={[10.4, 10.4]} /></mesh>
      <mesh ref={rim} material={rimMat}><torusGeometry args={[5, 0.05, 16, 200]} /></mesh>
      <mesh ref={rim2} material={rimMat2} position={[0, 0, -0.1]}><torusGeometry args={[5.5, 0.025, 12, 200, Math.PI * 1.5]} /></mesh>
    </group>
  )
}

/* =========================================================================== composed */
export function Backdrops() {
  const cyan = CYAN
  const tickTime = useMemo(() => cyan, [cyan])
  return (
    <>
      <Particles />
      <Floor />
      <HeroField />
      <PolarGrid position={[0, 0.1, -3.6]} size={12} ticks={120} speed={0.04} weight={() => wmax(S.engineering, S.phone)} />
      <PolarGrid position={[0, 0, -2.8]} size={9} ticks={60} speed={-0.12} color={tickTime} weight={() => rig.w[S.watch] * (1 - rig.zoom)} />
      <PolarGrid position={[0, 0.1, -4]} size={13} ticks={90} speed={0.06} weight={() => rig.w[S.lab]} />
      <PolarGrid position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} size={5} ticks={72} speed={0.22} color={tickTime} weight={() => rig.w[S.lab]} />
      <PolarGrid position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} size={9.6} ticks={96} speed={0.05} weight={() => rig.w[S.connected] * 0.8} />
      <Showroom />
      <SoundWaves />
      <LabScanner />
      <Network />
      <Portal />
    </>
  )
}
