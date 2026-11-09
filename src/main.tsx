import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'
import { useStore, type Quality } from './store/useStore'

function detectWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function detectQuality(): Quality {
  const q = new URLSearchParams(location.search).get('quality')
  if (q === 'low' || q === 'high') return q
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return coarse || window.innerWidth < 820 || mem <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2 ? 'low' : 'high'
}

useStore.setState({
  quality: detectQuality(),
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  webgl: detectWebGL(),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
