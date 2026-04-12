import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { SectionId } from '../store/scrollSectionStore'
import { useCinematicDepthStore } from '../store/cinematicDepthStore'

gsap.registerPlugin(ScrollTrigger)

const SECTION_ORDER: SectionId[] = ['hero', 'about', 'projects', 'contact']

export function useCinematicScroll(): void {
  const setDepth = useCinematicDepthStore((s) => s.setDepth)
  const setDepths = useCinematicDepthStore((s) => s.setDepths)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setDepths({ hero: 1, about: 0, projects: 0, contact: 0 })
      return
    }

    setDepths({ hero: 1, about: 0, projects: 0, contact: 0 })

    const timelines: gsap.core.Timeline[] = []

    SECTION_ORDER.forEach((id) => {
      const sectionEl = document.getElementById(id)
      if (!sectionEl) {
        return
      }

      const proxy = { depth: id === 'hero' ? 1 : 0 }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      tl.to(proxy, {
        depth: 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => {
          setDepth(id, proxy.depth)
        },
      }).to(proxy, {
        depth: 0,
        duration: 1,
        ease: 'none',
        onUpdate: () => {
          setDepth(id, proxy.depth)
        },
      })

      timelines.push(tl)
    })

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh()
    }, 80)

    return () => {
      window.clearTimeout(refreshTimer)
      timelines.forEach((timeline) => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
      })
    }
  }, [setDepth, setDepths])
}
