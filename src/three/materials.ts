import * as THREE from 'three'
import type { Finish, ProductId } from '../data/products'
import { PRODUCT_IDS } from '../data/products'
import { useStore } from '../store/useStore'

interface FinishPreset { metalness: number; roughness: number; clearcoat: number; clearcoatRoughness: number }

const PRIMARY: Record<Finish, FinishPreset> = {
  metallic: { metalness: 1.0, roughness: 0.26, clearcoat: 0.0, clearcoatRoughness: 0.2 },
  matte: { metalness: 0.25, roughness: 0.78, clearcoat: 0.0, clearcoatRoughness: 0.6 },
  glossy: { metalness: 0.7, roughness: 0.07, clearcoat: 1.0, clearcoatRoughness: 0.03 },
}
const SECONDARY: Record<Finish, FinishPreset> = {
  metallic: { metalness: 0.35, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.3 },
  matte: { metalness: 0.0, roughness: 0.88, clearcoat: 0.0, clearcoatRoughness: 0.6 },
  glossy: { metalness: 0.15, roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.04 },
}

export interface ProductMats {
  primary: THREE.MeshPhysicalMaterial
  secondary: THREE.MeshPhysicalMaterial
  tPrimary: THREE.Color
  tSecondary: THREE.Color
}

function mk(color: string): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color, envMapIntensity: 1.1 })
}

export const mats = {} as Record<ProductId, ProductMats>
for (const id of PRODUCT_IDS) {
  const c = useStore.getState().custom[id]
  mats[id] = {
    primary: mk(c.primary),
    secondary: mk(c.secondary),
    tPrimary: new THREE.Color(c.primary),
    tSecondary: new THREE.Color(c.secondary),
  }
  Object.assign(mats[id].primary, PRIMARY[c.finish])
  Object.assign(mats[id].secondary, SECONDARY[c.finish])
}

/** Shared non-customisable materials. */
export const shared = {
  glass: new THREE.MeshPhysicalMaterial({
    color: '#05070b', metalness: 0.0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6,
  }),
  clearGlass: new THREE.MeshPhysicalMaterial({
    color: '#cfe8ff', metalness: 0, roughness: 0.02, transparent: true, opacity: 0.16, clearcoat: 1,
    envMapIntensity: 2.2, depthWrite: false,
  }),
  lensGlass: new THREE.MeshPhysicalMaterial({
    color: '#070b1a', metalness: 0.1, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.01,
    iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [180, 520], envMapIntensity: 2.4,
  }),
  lensCoat: new THREE.MeshStandardMaterial({
    color: '#0c1f55', emissive: '#1b3bff', emissiveIntensity: 0.35, metalness: 0.9, roughness: 0.12, envMapIntensity: 2,
  }),
  darkMetal: new THREE.MeshStandardMaterial({ color: '#16181d', metalness: 0.9, roughness: 0.35 }),
  black: new THREE.MeshStandardMaterial({ color: '#07080a', metalness: 0.2, roughness: 0.6 }),
  rubber: new THREE.MeshStandardMaterial({ color: '#0e0f12', metalness: 0, roughness: 0.92 }),
  silver: new THREE.MeshStandardMaterial({ color: '#cfd4db', metalness: 1, roughness: 0.22 }),
  gold: new THREE.MeshStandardMaterial({ color: '#c9a45a', metalness: 1, roughness: 0.3 }),
  glowCyan: new THREE.MeshBasicMaterial({ color: new THREE.Color('#55E6FF').multiplyScalar(2.2), toneMapped: false }),
  glowBlue: new THREE.MeshBasicMaterial({ color: new THREE.Color('#426BFF').multiplyScalar(2.4), toneMapped: false }),
  warm: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a0').multiplyScalar(1.6), toneMapped: false }),
}

const lam = (dt: number, k = 7) => 1 - Math.exp(-k * dt)

/** Smoothly eases every product's materials toward the customised target (called once per frame). */
export function updateMaterials(dt: number) {
  const custom = useStore.getState().custom
  const t = lam(dt)
  for (const id of PRODUCT_IDS) {
    const c = custom[id]
    const m = mats[id]
    m.tPrimary.set(c.primary)
    m.tSecondary.set(c.secondary)
    m.primary.color.lerp(m.tPrimary, t)
    m.secondary.color.lerp(m.tSecondary, t)
    const pp = PRIMARY[c.finish]
    const sp = SECONDARY[c.finish]
    for (const k of ['metalness', 'roughness', 'clearcoat', 'clearcoatRoughness'] as const) {
      m.primary[k] += (pp[k] - m.primary[k]) * t
      m.secondary[k] += (sp[k] - m.secondary[k]) * t
    }
  }
}

/** Dispose all shared GPU resources (HMR / unmount safety). */
export function disposeMaterials() {
  for (const id of PRODUCT_IDS) { mats[id].primary.dispose(); mats[id].secondary.dispose() }
  Object.values(shared).forEach((m) => m.dispose())
}
