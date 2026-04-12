import { useEffect, useRef, useState } from 'react'
import { lenisInstance } from './useLenis'

export type FlyThroughState = {
  localTs: number[]
  progress: number
}

const PLANET_COUNT = 8

// Overlap constant: how far outside [0,1] a planet's localT can travel
// before it's considered off-screen. Larger = more overlap between adjacent
// planets, ensuring at least one is always partially visible.
const OVERLAP = 0.35

export function useFlyThroughDepth(): FlyThroughState {
  const [state, setState] = useState<FlyThroughState>({
    localTs: Array(PLANET_COUNT).fill(-OVERLAP - 0.1),
    progress: 0,
  })

  const targetRef = useRef<number[]>(Array(PLANET_COUNT).fill(-OVERLAP - 0.1))
  const currentRef = useRef<number[]>(Array(PLANET_COUNT).fill(-OVERLAP - 0.1))
  const rafRef = useRef<number | null>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    const calc = (scrollY: number) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const rawProgress = maxScroll > 0 ? scrollY / maxScroll : 0
      progressRef.current = rawProgress
      const segSize = 1 / PLANET_COUNT
      const next = Array.from({ length: PLANET_COUNT }, (_, i) => {
        const segStart = i * segSize
        return (rawProgress - segStart) / segSize
      })
      targetRef.current = next
    }

    const animate = () => {
      const cur = currentRef.current
      const tgt = targetRef.current
      const lerp = 0.14
      const next = cur.map((c, i) => c + (tgt[i] - c) * lerp)
      currentRef.current = next
      const settled = next.every((v, i) => Math.abs(v - tgt[i]) < 0.001)
      setState({ localTs: next, progress: progressRef.current })
      if (settled) {
        rafRef.current = null
        return
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    const schedule = (scrollY: number) => {
      calc(scrollY)
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(animate)
    }

    let unsubLenis: (() => void) | null = null
    let pollId = 0

    const trySubscribeLenis = () => {
      if (!lenisInstance) return false

      const onLenisScroll = ({ scroll }: { scroll: number }) => {
        schedule(scroll)
      }

      lenisInstance.on('scroll', onLenisScroll)
      unsubLenis = () => lenisInstance?.off('scroll', onLenisScroll)
      schedule(lenisInstance.scroll ?? window.scrollY)
      return true
    }

    if (!trySubscribeLenis()) {
      let attempts = 0
      pollId = window.setInterval(() => {
        attempts += 1
        if (trySubscribeLenis() || attempts > 20) {
          clearInterval(pollId)
          if (!lenisInstance) {
            const onNativeScroll = () => schedule(window.scrollY)
            window.addEventListener('scroll', onNativeScroll, { passive: true })
            unsubLenis = () => window.removeEventListener('scroll', onNativeScroll)
            schedule(window.scrollY)
          }
        }
      }, 100)
    }

    const onResize = () => schedule(lenisInstance?.scroll ?? window.scrollY)
    window.addEventListener('resize', onResize)

    return () => {
      clearInterval(pollId)
      unsubLenis?.()
      window.removeEventListener('resize', onResize)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return state
}
