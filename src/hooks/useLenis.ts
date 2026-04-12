import Lenis from 'lenis'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export let lenisInstance: Lenis | null = null

export function useLenis(useGsapTicker = false) {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      syncTouch: false,
    })
    lenisInstance = lenis

    let rafId = 0
    let tickerFn: ((time: number) => void) | null = null

    if (useGsapTicker) {
      tickerFn = (time: number) => {
        lenis.raf(time * 1000)
      }

      gsap.ticker.add(tickerFn)
      gsap.ticker.lagSmoothing(0)
      lenis.on('scroll', ScrollTrigger.update)
    } else {
      const raf = (time: number) => {
        lenis.raf(time)
        rafId = window.requestAnimationFrame(raf)
      }

      rafId = window.requestAnimationFrame(raf)
    }

    return () => {
      if (tickerFn) {
        gsap.ticker.remove(tickerFn)
        lenis.off('scroll', ScrollTrigger.update)
      } else {
        window.cancelAnimationFrame(rafId)
      }

      if (lenisInstance === lenis) {
        lenisInstance = null
      }

      lenis.destroy()
    }
  }, [useGsapTicker])
}
