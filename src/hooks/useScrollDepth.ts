import { useEffect, useRef, useState } from 'react'
import type { SectionId } from '../store/scrollSectionStore'
import { lerp } from '../utils/lerp'

const SECTIONS: SectionId[] = ['hero', 'about', 'projects', 'contact']

type DepthMap = Record<SectionId, number> // 0 = far away, 1 = fully centered

export function useScrollDepth(): DepthMap {
  const [depths, setDepths] = useState<DepthMap>({
    hero: 1,
    about: 0,
    projects: 0,
    contact: 0,
  })

  const targetRef = useRef<DepthMap>({ hero: 1, about: 0, projects: 0, contact: 0 })
  const currentRef = useRef<DepthMap>({ hero: 1, about: 0, projects: 0, contact: 0 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const calculateTarget = () => {
      const vh = window.innerHeight
      const next: DepthMap = { hero: 0, about: 0, projects: 0, contact: 0 }

      SECTIONS.forEach((id) => {
        const el = document.getElementById(id)
        if (!el) return

        const rect = el.getBoundingClientRect()
        // How centered is this section in the viewport?
        // 1.0 = perfectly centered, 0 = fully off screen
        const sectionCenter = rect.top + rect.height / 2
        const viewportCenter = vh / 2
        const distance = Math.abs(sectionCenter - viewportCenter)
        const maxDistance = vh // beyond 1 viewport = fully gone
        next[id] = Math.max(0, 1 - distance / maxDistance)
      })

      targetRef.current = next
    }

    const animateTowardsTarget = () => {
      const current = currentRef.current
      const target = targetRef.current
      const next: DepthMap = {
        hero: lerp(current.hero, target.hero, 0.18),
        about: lerp(current.about, target.about, 0.18),
        projects: lerp(current.projects, target.projects, 0.18),
        contact: lerp(current.contact, target.contact, 0.18),
      }

      currentRef.current = next
      setDepths(next)

      const settled =
        Math.abs(next.hero - target.hero) < 0.001 &&
        Math.abs(next.about - target.about) < 0.001 &&
        Math.abs(next.projects - target.projects) < 0.001 &&
        Math.abs(next.contact - target.contact) < 0.001

      if (settled) {
        currentRef.current = target
        setDepths(target)
        rafRef.current = null
        return
      }

      rafRef.current = requestAnimationFrame(animateTowardsTarget)
    }

    const schedule = () => {
      calculateTarget()
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(animateTowardsTarget)
    }

    schedule() // initial
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return depths
}
