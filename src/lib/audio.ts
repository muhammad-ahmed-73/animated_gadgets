/**
 * Optional ambient sound design — fully synthesised with the Web Audio API (no audio files).
 * Nothing starts until the visitor turns sound on.
 */
type AC = AudioContext

class SoundEngine {
  private ctx: AC | null = null
  private master: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private data: Uint8Array<ArrayBuffer> | null = null
  private timer: number | null = null
  private step = 0
  private smooth = 0
  on = false

  private build() {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()
    const master = ctx.createGain()
    master.gain.value = 0
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.82
    master.connect(analyser)
    analyser.connect(ctx.destination)

    // evolving pad: three detuned oscillators through a slow-moving low-pass
    const pad = ctx.createGain()
    pad.gain.value = 0.16
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 520
    lp.Q.value = 3
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 260
    lfo.connect(lfoGain).connect(lp.frequency)
    lfo.start()
    ;[55, 82.41, 110.4].forEach((f, i) => {
      const o = ctx.createOscillator()
      o.type = i === 1 ? 'sawtooth' : 'triangle'
      o.frequency.value = f
      o.detune.value = (i - 1) * 7
      o.connect(pad)
      o.start()
    })
    pad.connect(lp).connect(master)

    // shimmering delay for plucks
    const delay = ctx.createDelay(1)
    delay.delayTime.value = 0.37
    const fb = ctx.createGain()
    fb.gain.value = 0.42
    delay.connect(fb).connect(delay)
    delay.connect(master)

    this.ctx = ctx
    this.master = master
    this.analyser = analyser
    this.data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))
    this.delay = delay
  }
  private delay: DelayNode | null = null

  private pluck() {
    const ctx = this.ctx
    if (!ctx || !this.master || !this.delay) return
    const scale = [220, 261.63, 329.63, 392, 440, 523.25, 659.25]
    const seq = [0, 2, 4, 2, 5, 4, 2, 1]
    const f = scale[seq[this.step % seq.length]] * (this.step % 16 > 7 ? 1.5 : 1)
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = f
    const t = ctx.currentTime
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.09, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
    o.connect(g)
    g.connect(this.master)
    g.connect(this.delay)
    o.start(t)
    o.stop(t + 1.2)
    if (this.step % 4 === 0) {
      const k = ctx.createOscillator()
      const kg = ctx.createGain()
      k.frequency.setValueAtTime(110, t)
      k.frequency.exponentialRampToValueAtTime(38, t + 0.28)
      kg.gain.setValueAtTime(0.22, t)
      kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.34)
      k.connect(kg).connect(this.master)
      k.start(t)
      k.stop(t + 0.4)
    }
    this.step++
  }

  async start() {
    if (!this.ctx) this.build()
    const ctx = this.ctx!
    if (ctx.state === 'suspended') await ctx.resume()
    this.master!.gain.cancelScheduledValues(ctx.currentTime)
    this.master!.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.6)
    if (this.timer == null) this.timer = window.setInterval(() => this.pluck(), 420)
    this.on = true
  }

  stop() {
    this.on = false
    if (!this.ctx || !this.master) return
    const ctx = this.ctx
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
    if (this.timer != null) { clearInterval(this.timer); this.timer = null }
    window.setTimeout(() => { if (!this.on) void ctx.suspend() }, 800)
  }

  /** Short UI tick; silent unless sound is on. */
  blip(freq = 880) {
    if (!this.on || !this.ctx || !this.master) return
    const ctx = this.ctx
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = freq
    g.gain.setValueAtTime(0.05, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12)
    o.connect(g).connect(this.master)
    o.start()
    o.stop(ctx.currentTime + 0.14)
  }

  /** 0..1 smoothed loudness. */
  level(): number {
    if (!this.on || !this.analyser || !this.data) { this.smooth *= 0.94; return this.smooth }
    this.analyser.getByteFrequencyData(this.data)
    let s = 0
    for (let i = 0; i < 24; i++) s += this.data[i]
    const v = Math.min(1, s / 24 / 150)
    this.smooth += (v - this.smooth) * 0.25
    return this.smooth
  }
}

export const sound = new SoundEngine()
