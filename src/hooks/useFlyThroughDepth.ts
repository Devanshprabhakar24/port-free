import { useEffect, useRef, useState } from 'react'

export type FlyThroughState = {
  localTs: number[]
  progress: number
}

const PLANET_COUNT = 8

export function useFlyThroughDepth(): FlyThroughState {
  const [state, setState] = useState<FlyThroughState>({
    localTs: Array(PLANET_COUNT).fill(-0.5),
    progress: 0,
  })

  const targetRef = useRef<number[]>(Array(PLANET_COUNT).fill(-0.5))
  const currentRef = useRef<number[]>(Array(PLANET_COUNT).fill(-0.5))
  const rafRef = useRef<number | null>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    const calc = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const rawProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0
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

    const schedule = () => {
      calc()
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(animate)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return state
}
