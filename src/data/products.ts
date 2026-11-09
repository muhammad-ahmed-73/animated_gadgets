export type ProductId = 'phone' | 'watch' | 'buds' | 'headphones' | 'pod'
export const PRODUCT_IDS: ProductId[] = ['phone', 'watch', 'buds', 'headphones', 'pod']

export interface ProductInfo {
  id: ProductId
  name: string
  kicker: string
  headline: string[]
  desc: string
  specs: [string, string][]
}

export const PRODUCTS: Record<ProductId, ProductInfo> = {
  phone: {
    id: 'phone',
    name: 'NOVA PHONE',
    kicker: 'Flagship smartphone',
    headline: ['A window', 'to everything.'],
    desc: 'A single sheet of curved glass, a machined titanium-alloy frame and a three-lens spatial camera. The centre of your NOVA world.',
    specs: [['Display', '6.7" LTPO · 144 Hz'], ['Chip', 'N1 Neural · 3 nm'], ['Camera', '200 MP spatial array'], ['Battery', '5,200 mAh · 90 W']],
  },
  watch: {
    id: 'watch',
    name: 'NOVA WATCH',
    kicker: 'Living display wearable',
    headline: ['Time,', 'illuminated.'],
    desc: 'A sapphire-domed micro-LED face that wakes with a glance and reshapes itself around your day.',
    specs: [['Display', '1.9" micro-LED · 3000 nits'], ['Sensors', 'ECG · SpO₂ · thermal'], ['Battery', '9 days'], ['Case', 'Aero-grade titanium']],
  },
  buds: {
    id: 'buds',
    name: 'NOVA BUDS',
    kicker: 'Spatial wireless earbuds',
    headline: ['Silence,', 'engineered.'],
    desc: 'Adaptive noise cancellation that listens 48,000 times a second, in a charging case that fits any pocket.',
    specs: [['Drivers', '11 mm dual-coil'], ['ANC', 'Adaptive · −52 dB'], ['Battery', '8 h + 32 h case'], ['Codec', 'N-Lossless 24-bit']],
  },
  headphones: {
    id: 'headphones',
    name: 'NOVA HEADPHONES',
    kicker: 'Over-ear studio headphones',
    headline: ['Every note.', 'In orbit.'],
    desc: 'Forged yokes, memory-foam cushions and a 50 mm beryllium driver tuned to reveal what the studio heard.',
    specs: [['Driver', '50 mm beryllium'], ['ANC', 'Hybrid · 6 mics'], ['Battery', '60 h'], ['Weight', '248 g']],
  },
  pod: {
    id: 'pod',
    name: 'NOVA POD',
    kicker: 'Portable smart speaker',
    headline: ['Sound,', 'in every direction.'],
    desc: 'A compact 360° speaker with a haptic light ring that moves with your music and a room-sensing mic array.',
    specs: [['Audio', '360° · 40 W'], ['Range', 'Room-adaptive tuning'], ['Battery', '24 h'], ['Rating', 'IP67']],
  },
}

export interface SectionInfo {
  id: string
  index: string
  label: string
  /** scroll height in viewport heights */
  vh: number
}

export const SECTIONS: SectionInfo[] = [
  { id: 'awakening', index: '01', label: 'The Awakening', vh: 340 },
  { id: 'engineering', index: '02', label: 'Engineered to Perfection', vh: 480 },
  { id: 'ecosystem', index: '03', label: 'The NOVA Ecosystem', vh: 360 },
  { id: 'phone', index: '04', label: 'The Smartphone Experience', vh: 420 },
  { id: 'watch', index: '05', label: 'Time, Redefined', vh: 420 },
  { id: 'audio', index: '06', label: 'Sound Without Limits', vh: 400 },
  { id: 'lab', index: '07', label: 'The Material Lab', vh: 300 },
  { id: 'connected', index: '08', label: 'The Future Is Connected', vh: 340 },
  { id: 'finale', index: '09', label: 'The Final Transmission', vh: 320 },
]

export const S = {
  awakening: 0, engineering: 1, ecosystem: 2, phone: 3, watch: 4, audio: 5, lab: 6, connected: 7, finale: 8,
} as const

export interface Swatch { id: string; name: string; hex: string }
export const SWATCHES: Swatch[] = [
  { id: 'obsidian', name: 'Obsidian Black', hex: '#15171c' },
  { id: 'titanium', name: 'Titanium Silver', hex: '#c5cbd3' },
  { id: 'arctic', name: 'Arctic White', hex: '#eef1f5' },
  { id: 'blue', name: 'Electric Blue', hex: '#426bff' },
  { id: 'purple', name: 'Cosmic Purple', hex: '#7a4dff' },
]

export type Finish = 'metallic' | 'matte' | 'glossy'
export const FINISHES: Finish[] = ['metallic', 'matte', 'glossy']

/** Which devices talk to which in the connected-ecosystem section. */
export const LINKS: [ProductId, ProductId, string][] = [
  ['phone', 'watch', 'Instant handoff'],
  ['phone', 'buds', 'Seamless pairing'],
  ['phone', 'headphones', 'Lossless streaming'],
  ['phone', 'pod', 'Cast to room'],
  ['watch', 'buds', 'Biometric audio'],
  ['buds', 'headphones', 'Auto-switch'],
  ['headphones', 'pod', 'Multi-room sync'],
  ['pod', 'watch', 'Voice relay'],
]
