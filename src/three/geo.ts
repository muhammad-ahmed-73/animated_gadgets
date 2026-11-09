import * as THREE from 'three'

export function roundedRectShape(w: number, h: number, r: number, shape = new THREE.Shape()) {
  const x = -w / 2, y = -h / 2
  r = Math.min(r, w / 2, h / 2)
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  shape.lineTo(x + w, y + h - r)
  shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  shape.lineTo(x + r, y + h)
  shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  shape.lineTo(x, y + r)
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return shape
}

/** Beveled rounded-rect slab, centred on origin, extruded along Z. */
export function slab(w: number, h: number, r: number, depth: number, bevel = 0.008, bevelSegments = 4) {
  const g = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
    depth: Math.max(0.0001, depth - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments,
    curveSegments: 28,
  })
  g.center()
  return g
}

/** Rounded-rect ring (frame) with a rounded hole. */
export function ring(w: number, h: number, r: number, wall: number, depth: number, bevel = 0.008) {
  const shape = roundedRectShape(w, h, r)
  shape.holes.push(roundedRectShape(w - wall * 2, h - wall * 2, Math.max(0.005, r - wall)))
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.0001, depth - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.9,
    bevelSegments: 4,
    curveSegments: 28,
  })
  g.center()
  return g
}

/** Flat rounded plane with 0..1 UVs, for emissive canvas textures. */
export function flatRounded(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 24)
  const pos = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h)
  return g
}

/** Bend a box-like strip around X: used for watch straps. Strip runs along +Y from 0..length. */
export function bentStrap(width: number, length: number, thick: number, radius: number, segs = 48) {
  const g = new THREE.BoxGeometry(width, length, thick, 6, segs, 2)
  g.translate(0, length / 2, 0)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const s = p.getY(i)
    const t = p.getZ(i)
    const a = s / radius
    // curve strap away from the viewer (towards -Z) like a wrist band
    p.setY(i, (radius + t) * Math.sin(a))
    p.setZ(i, -radius + (radius + t) * Math.cos(a))
  }
  g.computeVertexNormals()
  return g
}

const cache = new Map<string, THREE.BufferGeometry>()
/** Memoised geometry factory so repeated device instances share GPU buffers. */
export function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = cache.get(key)
  if (!g) { g = make(); cache.set(key, g) }
  return g as T
}
