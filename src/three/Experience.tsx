import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { rig, easeOut } from '../lib/rig'
import { scrollModel } from '../lib/scroll'
import { S } from '../data/products'
import { Devices } from './Devices'
import { Director } from './Director'
import { Backdrops } from './Backdrops'

/* ------------------------------------------------------------ lighting rig */
function Lights() {
  const key = useRef<THREE.DirectionalLight>(null)
  const amb = useRef<THREE.AmbientLight>(null)
  const sweep = useRef<THREE.PointLight>(null)
  const rimA = useRef<THREE.PointLight>(null)
  const rimB = useRef<THREE.PointLight>(null)
  const quality = useStore((s) => s.quality)

  useFrame(({ scene }) => {
    const i = easeOut(rig.intro)
    const t = rig.time
    scene.environmentIntensity = 0.15 + 0.85 * i
    if (amb.current) amb.current.intensity = 0.12 + 0.2 * i
    if (key.current) key.current.intensity = 1.6 * i
    // lighting sweep gliding across the metallic surfaces
    if (sweep.current) {
      sweep.current.position.set(Math.sin(t * 0.55) * 4.5, 1.5 + Math.sin(t * 0.3), 3.2)
      sweep.current.intensity = 55 * i * (0.4 + 0.6 * Math.max(rig.w[S.awakening], rig.w[S.engineering], rig.w[S.phone], rig.w[S.watch]))
    }
    if (rimA.current) rimA.current.intensity = 70 * i
    if (rimB.current) rimB.current.intensity = 60 * i
  })
  return (
    <>
      <ambientLight ref={amb} intensity={0.12} />
      <directionalLight
        ref={key}
        position={[3, 7, 5]}
        intensity={0}
        castShadow={quality === 'high'}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
      <pointLight ref={sweep} color="#ffffff" distance={18} decay={2} />
      <pointLight ref={rimA} position={[-5, 1.5, -3.5]} color="#55E6FF" distance={22} decay={2} />
      <pointLight ref={rimB} position={[5, 2.5, -4]} color="#426BFF" distance={22} decay={2} />
    </>
  )
}

/** Procedural studio environment: no network fetch, reflections come from soft-boxes and strip lights. */
function Env() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[0, 6, 2]} scale={[12, 6, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={7} color="#426BFF" position={[-7, 1, -1]} scale={[1.2, 9, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={6} color="#55E6FF" position={[7, 1, 1]} scale={[1.2, 9, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer form="rect" intensity={2.2} color="#e8f0ff" position={[0, 1, 7]} scale={[8, 3, 1]} />
      <Lightformer form="ring" intensity={4} color="#ffffff" position={[0, 2, -7]} scale={6} />
      <Lightformer form="rect" intensity={0.6} color="#6a7bff" position={[0, -5, 0]} scale={[14, 6, 1]} rotation-x={-Math.PI / 2} />
    </Environment>
  )
}

/* ------------------------------------------------------------ post-processing */
function Post() {
  const ca = useRef<{ offset: THREE.Vector2 }>(null)
  const reduced = useStore((s) => s.reduced)
  useFrame(() => {
    if (ca.current && !reduced) {
      const v = Math.min(1, Math.abs(scrollModel.vel) * 5)
      ca.current.offset.set(0.0002 + v * 0.0012, 0.0001 + v * 0.0007)
    }
  })
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.9} luminanceSmoothing={0.2} radius={0.7} />
      <ChromaticAberration ref={ca as never} offset={new THREE.Vector2(0.0002, 0.0001)} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.2} darkness={0.85} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}

/** Compiles shaders / uploads textures up front, then reports readiness to the loader. */
function Ready() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    let raf = 0
    let n = 0
    try { gl.compile(scene, camera) } catch { /* non-fatal */ }
    const tick = () => {
      if (++n > 8) useStore.getState().set({ ready: true })
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [gl, scene, camera])
  return null
}

export function Experience() {
  const quality = useStore((s) => s.quality)
  const [dpr, setDpr] = useState<[number, number]>(quality === 'low' ? [1, 1.5] : [1, 2])

  return (
    <Canvas
      className="scene-canvas"
      dpr={dpr}
      shadows={quality === 'high' ? 'soft' : false}
      camera={{ fov: 35, near: 0.1, far: 90, position: [0, 0.1, 9] }}
      gl={{ antialias: quality === 'high', powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onCreated={({ gl }) => { gl.setClearColor('#050608') }}
      aria-hidden="true"
    >
      <color attach="background" args={['#050608']} />
      <fog attach="fog" args={['#050608', 16, 52]} />
      <PerformanceMonitor
        onDecline={() => setDpr((d) => [1, Math.max(1, d[1] - 0.5)])}
        onIncline={() => setDpr((d) => [1, Math.min(quality === 'low' ? 1.5 : 2, d[1] + 0.25)])}
        flipflops={3}
      />
      <Suspense fallback={null}>
        <Director />
        <Lights />
        <Env />
        <Devices />
        <Backdrops />
        {quality === 'high' && <Post />}
        <Ready />
      </Suspense>
    </Canvas>
  )
}
