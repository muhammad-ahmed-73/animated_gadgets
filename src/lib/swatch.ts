import { SWATCHES } from '../data/products'

export const swatchName = (hex: string) => SWATCHES.find((s) => s.hex === hex)?.name ?? 'Custom'
