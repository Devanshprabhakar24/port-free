import { useEffect, useRef, useState } from 'react'
import type { SectionId } from '../store/scrollSectionStore'
import { lerp } from '../utils/lerp'

const SECTIONS: SectionId[] = ['hero', 'about', 'projects', 'contact']

export type DepthMap = Record<SectionId, number>

export function useScrollDepth(): DepthMap {
  const [depths, setDepths] = useState<DepthMap>({
    hero: 1, about: 0, projects: 0, contact: 0,
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
        const sectionCenter = rect.top + rect.height / 2
        const viewportCenter = vh / 2
        const distance = Math.abs(sectionCenter - viewportCenter)
        // 0.8*vh: sharper depth peak, focused planet dominates clearly
        const maxDistance = vh * 0.8
        next[id] = Math.max(0, 1 - distance / maxDistance)
      })

      targetRef.current = next
    }

    const animateTowardsTarget = () => {
      const current = currentRef.current
      const target = targetRef.current
      // lerp 0.12: snaps cleanly, eliminates ghost-drift
      const next: DepthMap = {
        hero:     lerp(current.hero,     target.hero,     0.12),
        about:    lerp(current.about,    target.about,    0.12),
        projects: lerp(current.projects, target.projects, 0.12),
        contact:  lerp(current.contact,  target.contact,  0.12),
      }
      currentRef.current = next
      setDepths(next)
      // 0.0008: tighter settlement threshold
      const settled =
        Math.abs(next.hero     - target.hero)     < 0.0008 &&
        Math.abs(next.about    - target.about)    < 0.0008 &&
        Math.abs(next.projects - target.projects) < 0.0008 &&
        Math.abs(next.contact  - target.contact)  < 0.0008
      if (settled) {
        currentRef.current = target
        setDepths({ ...target })
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

    schedule()
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
