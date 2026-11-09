import * as THREE from 'three'

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function finish(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/* ---------------------------------------------------------------- phone screens */
export const SCREEN_NAMES = ['AURORA', 'EVENT HORIZON', 'SOLAR']

export function makePhoneScreen(variant: number) {
  const W = 512, H = 1056
  const c = canvas(W, H)
  const x = c.getContext('2d')!
  const bg = x.createLinearGradient(0, 0, W, H)
  if (variant === 0) { bg.addColorStop(0, '#050a24'); bg.addColorStop(0.5, '#10246e'); bg.addColorStop(1, '#1d6fb0') }
  else if (variant === 1) { bg.addColorStop(0, '#000'); bg.addColorStop(0.55, '#0a0a14'); bg.addColorStop(1, '#2a1260') }
  else { bg.addColorStop(0, '#2a0b20'); bg.addColorStop(0.5, '#b8431f'); bg.addColorStop(1, '#ffb347') }
  x.fillStyle = bg
  x.fillRect(0, 0, W, H)

  // wallpaper art
  x.globalCompositeOperation = 'lighter'
  if (variant === 0) {
    for (let i = 0; i < 7; i++) {
      const g = x.createRadialGradient(130 + i * 40, 700 - i * 60, 0, 130 + i * 40, 700 - i * 60, 300)
      g.addColorStop(0, `rgba(85,230,255,${0.22 - i * 0.02})`)
      g.addColorStop(1, 'rgba(85,230,255,0)')
      x.fillStyle = g
      x.fillRect(0, 0, W, H)
    }
    x.lineWidth = 2
    for (let i = 0; i < 18; i++) {
      x.strokeStyle = `rgba(120,200,255,${0.05 + i * 0.012})`
      x.beginPath()
      x.moveTo(-20, 760 + i * 14)
      x.bezierCurveTo(150, 600 - i * 10, 330, 900 - i * 16, W + 20, 640 + i * 12)
      x.stroke()
    }
  } else if (variant === 1) {
    for (let i = 0; i < 40; i++) {
      x.strokeStyle = `rgba(110,140,255,${0.04 + i * 0.004})`
      x.lineWidth = 1.5
      x.beginPath()
      x.ellipse(256, 640, 40 + i * 8, 18 + i * 5, -0.3, 0, Math.PI * 2)
      x.stroke()
    }
    const g = x.createRadialGradient(256, 640, 0, 256, 640, 70)
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(120,150,255,0)')
    x.fillStyle = g
    x.fillRect(0, 0, W, H)
  } else {
    const g = x.createRadialGradient(256, 760, 0, 256, 760, 260)
    g.addColorStop(0, 'rgba(255,240,180,0.9)'); g.addColorStop(0.4, 'rgba(255,170,70,0.4)'); g.addColorStop(1, 'rgba(255,120,40,0)')
    x.fillStyle = g
    x.fillRect(0, 0, W, H)
  }
  x.globalCompositeOperation = 'source-over'

  // status bar
  x.fillStyle = '#fff'
  x.font = '600 24px Sora, system-ui, sans-serif'
  x.textAlign = 'left'
  x.fillText('9:41', 52, 62)
  x.textAlign = 'right'
  x.fillText('5G  ▮▮▮', W - 52, 62)
  // punch hole
  x.fillStyle = '#000'
  x.beginPath(); x.arc(W / 2, 54, 15, 0, Math.PI * 2); x.fill()

  // clock
  x.textAlign = 'center'
  x.fillStyle = 'rgba(255,255,255,0.75)'
  x.font = '500 26px Sora, system-ui, sans-serif'
  x.fillText('FRIDAY · 7 NOVEMBER', W / 2, 190)
  x.fillStyle = '#fff'
  x.font = '700 190px Sora, system-ui, sans-serif'
  x.fillText('9:41', W / 2, 360)

  // widgets
  const widget = (px: number, py: number, w: number, h: number, title: string, value: string) => {
    x.fillStyle = 'rgba(255,255,255,0.12)'
    rr(x, px, py, w, h, 30); x.fill()
    x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 1.5; x.stroke()
    x.textAlign = 'left'
    x.fillStyle = 'rgba(255,255,255,0.65)'; x.font = '500 20px Sora, sans-serif'
    x.fillText(title, px + 26, py + 42)
    x.fillStyle = '#fff'; x.font = '700 44px Sora, sans-serif'
    x.fillText(value, px + 26, py + h - 30)
  }
  widget(40, 420, 210, 150, 'STEPS', '8,412')
  widget(262, 420, 210, 150, 'FOCUS', '92%')

  // app grid
  const hues = ['#426BFF', '#55E6FF', '#7a4dff', '#ffffff', '#426BFF', '#55E6FF', '#7a4dff', '#ffffff']
  for (let i = 0; i < 8; i++) {
    const gx = 56 + (i % 4) * 108, gy = 640 + Math.floor(i / 4) * 120
    x.fillStyle = 'rgba(255,255,255,0.1)'
    rr(x, gx, gy, 84, 84, 26); x.fill()
    x.fillStyle = hues[i]
    x.globalAlpha = 0.9
    x.beginPath(); x.arc(gx + 42, gy + 42, 14, 0, Math.PI * 2); x.fill()
    x.globalAlpha = 1
  }
  // dock
  x.fillStyle = 'rgba(255,255,255,0.14)'
  rr(x, 40, 930, 432, 100, 40); x.fill()
  for (let i = 0; i < 4; i++) {
    x.fillStyle = 'rgba(255,255,255,0.22)'
    rr(x, 66 + i * 104, 944, 72, 72, 24); x.fill()
  }
  // home bar
  x.fillStyle = 'rgba(255,255,255,0.85)'
  rr(x, W / 2 - 70, H - 26, 140, 7, 4); x.fill()
  return finish(c)
}

/* ---------------------------------------------------------------- PCB */
export function makePCB() {
  const c = canvas(512, 1024)
  const x = c.getContext('2d')!
  x.fillStyle = '#071326'
  x.fillRect(0, 0, 512, 1024)
  x.lineWidth = 2
  for (let i = 0; i < 140; i++) {
    const px = Math.random() * 512, py = Math.random() * 1024
    x.strokeStyle = Math.random() > 0.7 ? 'rgba(85,230,255,0.55)' : 'rgba(210,170,90,0.35)'
    x.beginPath()
    x.moveTo(px, py)
    x.lineTo(px + (Math.random() - 0.5) * 160, py)
    x.lineTo(px + (Math.random() - 0.5) * 160, py + (Math.random() - 0.5) * 160)
    x.stroke()
    x.fillStyle = 'rgba(210,170,90,0.7)'
    x.beginPath(); x.arc(px, py, 3, 0, Math.PI * 2); x.fill()
  }
  x.strokeStyle = 'rgba(85,230,255,0.4)'
  x.lineWidth = 3
  rr(x, 10, 10, 492, 1004, 40); x.stroke()
  return finish(c)
}

export function makeBatteryLabel() {
  const c = canvas(512, 768)
  const x = c.getContext('2d')!
  const g = x.createLinearGradient(0, 0, 0, 768)
  g.addColorStop(0, '#e9edf2'); g.addColorStop(1, '#bcc4cf')
  x.fillStyle = g
  x.fillRect(0, 0, 512, 768)
  x.fillStyle = '#426BFF'
  x.fillRect(0, 0, 512, 90)
  x.fillStyle = '#fff'
  x.font = '700 44px Sora, sans-serif'
  x.textAlign = 'left'
  x.fillText('NOVA CELL', 36, 62)
  x.fillStyle = '#101216'
  x.font = '700 78px Sora, sans-serif'
  x.fillText('5200', 36, 260)
  x.font = '500 34px Sora, sans-serif'
  x.fillText('mAh · 3.88 V · Li-Po', 36, 312)
  x.fillStyle = 'rgba(16,18,22,0.6)'
  x.font = '500 24px JetBrains Mono, monospace'
  x.fillText('NV-B52 / 20.2 Wh', 36, 380)
  for (let i = 0; i < 38; i++) { x.fillStyle = '#101216'; x.fillRect(36 + i * 10, 620, Math.random() > 0.5 ? 6 : 3, 90) }
  return finish(c)
}

/* ---------------------------------------------------------------- speaker fabric */
export function makeFabric() {
  const c = canvas(256, 256)
  const x = c.getContext('2d')!
  x.fillStyle = '#7a7f87'
  x.fillRect(0, 0, 256, 256)
  for (let yy = 0; yy < 64; yy++) {
    for (let xx = 0; xx < 64; xx++) {
      const ox = (yy % 2) * 2
      x.fillStyle = '#2b2e33'
      x.beginPath(); x.arc(xx * 4 + ox + 1, yy * 4 + 2, 1.15, 0, Math.PI * 2); x.fill()
    }
  }
  const t = finish(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(6, 3)
  return t
}

/* ---------------------------------------------------------------- watch faces */
export const FACE_NAMES = ['ORBIT', 'PULSE', 'AERO', 'GRID']
export const WATCH_W = 400
export const WATCH_H = 484

function bg(x: CanvasRenderingContext2D) {
  x.fillStyle = '#000'
  x.fillRect(0, 0, WATCH_W, WATCH_H)
}

const FACES: ((x: CanvasRenderingContext2D, t: number) => void)[] = [
  // ORBIT — analogue with cyan orbit ring
  (x, t) => {
    bg(x)
    const cx = WATCH_W / 2, cy = WATCH_H / 2
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2
      const big = i % 5 === 0
      x.strokeStyle = big ? '#fff' : 'rgba(255,255,255,0.35)'
      x.lineWidth = big ? 4 : 2
      x.beginPath()
      x.moveTo(cx + Math.cos(a) * (big ? 168 : 178), cy + Math.sin(a) * (big ? 168 : 178))
      x.lineTo(cx + Math.cos(a) * 192, cy + Math.sin(a) * 192)
      x.stroke()
    }
    const d = new Date()
    const s = d.getSeconds() + d.getMilliseconds() / 1000
    const m = d.getMinutes() + s / 60
    const h = (d.getHours() % 12) + m / 60
    const hand = (ang: number, len: number, w: number, col: string) => {
      x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'
      x.beginPath(); x.moveTo(cx, cy)
      x.lineTo(cx + Math.sin(ang) * len, cy - Math.cos(ang) * len); x.stroke()
    }
    x.strokeStyle = 'rgba(85,230,255,0.9)'; x.lineWidth = 6
    x.beginPath(); x.arc(cx, cy, 130, -Math.PI / 2, -Math.PI / 2 + (s / 60) * Math.PI * 2); x.stroke()
    hand((h / 12) * Math.PI * 2, 80, 10, '#fff')
    hand((m / 60) * Math.PI * 2, 125, 6, '#fff')
    x.fillStyle = '#55E6FF'; x.beginPath(); x.arc(cx, cy, 9, 0, Math.PI * 2); x.fill()
    x.fillStyle = 'rgba(255,255,255,0.55)'; x.font = '600 20px JetBrains Mono, monospace'; x.textAlign = 'center'
    x.fillText('NOVA', cx, cy + 70)
    void t
  },
  // PULSE — digital + activity rings
  (x, t) => {
    bg(x)
    const cx = WATCH_W / 2
    const d = new Date()
    const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0')
    x.textAlign = 'center'; x.fillStyle = '#fff'; x.font = '700 120px Sora, sans-serif'
    x.fillText(`${hh}:${mm}`, cx, 190)
    x.fillStyle = 'rgba(255,255,255,0.5)'; x.font = '500 22px JetBrains Mono, monospace'
    x.fillText('FRI 07 NOV', cx, 228)
    const rings: [number, number, string][] = [[0.78, 62, '#426BFF'], [0.55, 46, '#55E6FF'], [0.92, 30, '#fff']]
    rings.forEach(([v, r, col], i) => {
      const cxr = 90 + i * 110
      x.lineWidth = 11; x.strokeStyle = 'rgba(255,255,255,0.1)'
      x.beginPath(); x.arc(cxr, 340, r * 0.82, 0, Math.PI * 2); x.stroke()
      x.strokeStyle = col; x.lineCap = 'round'
      const vv = v * (0.9 + 0.1 * Math.sin(t * 2 + i))
      x.beginPath(); x.arc(cxr, 340, r * 0.82, -Math.PI / 2, -Math.PI / 2 + vv * Math.PI * 2); x.stroke()
    })
    x.fillStyle = '#ff5a6e'; x.font = '700 30px Sora, sans-serif'
    x.fillText(`♥ ${72 + Math.round(Math.sin(t * 3) * 3)}`, cx, 440)
  },
  // AERO — huge gradient numerals
  (x, t) => {
    bg(x)
    const g = x.createLinearGradient(0, 80, 0, 420)
    g.addColorStop(0, '#55E6FF'); g.addColorStop(1, '#426BFF')
    const d = new Date()
    x.textAlign = 'center'
    x.fillStyle = g; x.font = '800 230px Sora, sans-serif'
    x.fillText(String(d.getHours()).padStart(2, '0'), WATCH_W / 2, 230)
    x.fillStyle = '#fff'
    x.fillText(String(d.getMinutes()).padStart(2, '0'), WATCH_W / 2, 440)
    x.fillStyle = `rgba(85,230,255,${0.5 + 0.5 * Math.sin(t * 4)})`
    x.fillRect(WATCH_W - 36, 40, 10, 10)
  },
  // GRID — data / waveform
  (x, t) => {
    bg(x)
    x.strokeStyle = 'rgba(66,107,255,0.28)'; x.lineWidth = 1
    for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(0, i * 42); x.lineTo(WATCH_W, i * 42); x.stroke() }
    for (let i = 0; i < 10; i++) { x.beginPath(); x.moveTo(i * 44, 0); x.lineTo(i * 44, WATCH_H); x.stroke() }
    x.strokeStyle = '#55E6FF'; x.lineWidth = 4
    x.beginPath()
    for (let i = 0; i <= WATCH_W; i += 4) {
      const y = 260 + Math.sin(i * 0.03 + t * 3) * 50 * Math.sin(i * 0.008 + t) + Math.sin(i * 0.11 + t * 5) * 12
      if (i === 0) x.moveTo(i, y); else x.lineTo(i, y)
    }
    x.stroke()
    const d = new Date()
    x.fillStyle = '#fff'; x.font = '700 64px JetBrains Mono, monospace'; x.textAlign = 'left'
    x.fillText(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, 28, 100)
    x.fillStyle = 'rgba(255,255,255,0.6)'; x.font = '500 20px JetBrains Mono, monospace'
    x.fillText('SPO2 98%  ·  HRV 64ms', 28, 140)
    x.fillText('CORE 36.6°C', 28, 450)
  },
]

export interface WatchFaceTexture {
  texture: THREE.CanvasTexture
  draw: (from: number, to: number, mix: number, t: number) => void
}

export function makeWatchFaceTexture(): WatchFaceTexture {
  const c = canvas(WATCH_W, WATCH_H)
  const x = c.getContext('2d')!
  const texture = finish(c)
  const draw = (from: number, to: number, mix: number, t: number) => {
    x.globalAlpha = 1
    FACES[from](x, t)
    if (mix > 0 && from !== to) {
      // crossfade with a cyan scanline wipe
      x.globalAlpha = mix
      FACES[to](x, t)
      x.globalAlpha = 1
      const y = mix * WATCH_H
      const g = x.createLinearGradient(0, y - 30, 0, y + 6)
      g.addColorStop(0, 'rgba(85,230,255,0)'); g.addColorStop(1, 'rgba(85,230,255,0.9)')
      x.fillStyle = g
      x.fillRect(0, y - 30, WATCH_W, 36)
    }
    texture.needsUpdate = true
  }
  return { texture, draw }
}

export function makeSparkTexture() {
  const c = canvas(64, 64)
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 64, 64)
  return finish(c, false)
}
