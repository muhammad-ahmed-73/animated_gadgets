import { create } from 'zustand'
import { type Finish, type ProductId } from '../data/products'

export interface Custom { primary: string; secondary: string; finish: Finish }

const DEFAULT_CUSTOM: Record<ProductId, Custom> = {
  phone: { primary: '#c5cbd3', secondary: '#15171c', finish: 'metallic' },
  watch: { primary: '#c5cbd3', secondary: '#15171c', finish: 'metallic' },
  buds: { primary: '#eef1f5', secondary: '#c5cbd3', finish: 'glossy' },
  headphones: { primary: '#c5cbd3', secondary: '#15171c', finish: 'metallic' },
  pod: { primary: '#c5cbd3', secondary: '#15171c', finish: 'matte' },
}

export type Quality = 'high' | 'low'

interface State {
  // lifecycle
  ready: boolean
  introDone: boolean
  quality: Quality
  reduced: boolean
  webgl: boolean
  activeSection: number
  menuOpen: boolean
  soundOn: boolean
  // pointer
  hovered: ProductId | null
  cursorLabel: string | null
  // ecosystem
  focus: ProductId | null
  // phone section
  phoneExplode: boolean
  phoneScreen: number
  phoneHotspot: string | null
  // watch section
  watchFace: number
  strapOff: boolean
  watchZoom: boolean
  watchHotspot: string | null
  // audio section
  caseOpen: boolean
  budsOut: boolean
  // lab
  labProduct: ProductId
  custom: Record<ProductId, Custom>
  labZoom: number
  // connected
  connSel: ProductId | null

  set: (p: Partial<State>) => void
  setCustom: (id: ProductId, c: Partial<Custom>) => void
  resetCustom: (id: ProductId) => void
}

export const useStore = create<State>((set) => ({
  ready: false,
  introDone: false,
  quality: 'high',
  reduced: false,
  webgl: true,
  activeSection: 0,
  menuOpen: false,
  soundOn: false,
  hovered: null,
  cursorLabel: null,
  focus: null,
  phoneExplode: false,
  phoneScreen: 0,
  phoneHotspot: null,
  watchFace: 0,
  strapOff: false,
  watchZoom: false,
  watchHotspot: null,
  caseOpen: false,
  budsOut: false,
  labProduct: 'phone',
  custom: structuredClone(DEFAULT_CUSTOM),
  labZoom: 0.3,
  connSel: null,

  set: (p) => set(p),
  setCustom: (id, c) => set((s) => ({ custom: { ...s.custom, [id]: { ...s.custom[id], ...c } } })),
  resetCustom: (id) => set((s) => ({ custom: { ...s.custom, [id]: { ...DEFAULT_CUSTOM[id] } } })),
}))
