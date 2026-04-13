/**
 * Zero-allocation, ref-based scroll store for the planet system.
 * NO React state — no re-renders on scroll.
 * The Three.js useFrame loop reads this directly.
 */
import { lenisInstance } from './useLenis'

const PLANET_COUNT = 6

// Each planet's "segment" is 1/PLANET_COUNT of the page.
// segOverlap stretches each planet's lifetime so adjacent planets overlap.
const SEG_OVERLAP = 1.35

// Module-level scroll data — mutable, read from useFrame
export const scrollStore = {
  localTs: new Float64Array(PLANET_COUNT).fill(-1),
  progress: 0,
  smoothProgress: 0,
  velocity: 0,
  _initialized: false,
}

function recalc(scrollY: number) {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const raw = scrollY / maxScroll
  scrollStore.velocity = (raw - scrollStore.progress) * 60
  scrollStore.progress = raw
  const segSize = 1 / PLANET_COUNT
  for (let i = 0; i < PLANET_COUNT; i++) {
    const center = (i + 0.5) * segSize
    const halfLife = (segSize * SEG_OVERLAP) / 2
    scrollStore.localTs[i] = (raw - (center - halfLife)) / (halfLife * 2)
  }
}

/** Call once from your layout to bind scroll events */
export function initScrollStore() {
  if (scrollStore._initialized) return
  scrollStore._initialized = true

  let pollId = 0

  const trySubscribeLenis = (): boolean => {
    if (!lenisInstance) return false
    const onScroll = ({ scroll }: { scroll: number }) => recalc(scroll)
    lenisInstance.on('scroll', onScroll)
    recalc(lenisInstance.scroll ?? window.scrollY)
    return true
  }

  if (!trySubscribeLenis()) {
    let attempts = 0
    pollId = window.setInterval(() => {
      attempts += 1
      if (trySubscribeLenis() || attempts > 20) {
        clearInterval(pollId)
        if (!lenisInstance) {
          const onNativeScroll = () => recalc(window.scrollY)
          window.addEventListener('scroll', onNativeScroll, { passive: true })
        }
        recalc(window.scrollY)
      }
    }, 100)
  }

  window.addEventListener('resize', () => recalc(lenisInstance?.scroll ?? window.scrollY))
}
