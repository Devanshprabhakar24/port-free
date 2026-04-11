import { useEffect, useMemo, useState } from 'react'
import { useScrollSectionStore } from '../store/scrollSectionStore'
import type { SectionId } from '../store/scrollSectionStore'
import { useTransitionStore } from '../store/transitionStore'

export function useScrollSection(sectionIds: SectionId[]) {
  const currentSection = useScrollSectionStore((s) => s.currentSection)
  const previousSection = useScrollSectionStore((s) => s.previousSection)
  const setSection = useScrollSectionStore((s) => s.setSection)
  const setVelocityBand = useScrollSectionStore((s) => s.setVelocityBand)
  const triggerTransition = useTransitionStore((s) => s.triggerTransition)

  useEffect(() => {
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!sectionElements.length) {
      return
    }

    let debounceTimer: number | null = null

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (!visible.length) {
          return
        }

        const nextId = visible[0].target.id as SectionId

        if (debounceTimer !== null) {
          window.clearTimeout(debounceTimer)
        }

        debounceTimer = window.setTimeout(() => {
          setSection(nextId)
        }, 80)
      },
      {
        threshold: [0.4, 0.6, 0.8],
      },
    )

    sectionElements.forEach((element) => observer.observe(element))

    return () => {
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer)
      }
      observer.disconnect()
    }
  }, [sectionIds, setSection])

  useEffect(() => {
    let lastY = window.scrollY
    let lastT = performance.now()
    let fastTimer: number | null = null
    let cooldownUntil = 0

    const onScroll = () => {
      const now = performance.now()
      const y = window.scrollY
      const dt = Math.max(1, now - lastT)
      const velocity = (Math.abs(y - lastY) / dt) * 1000

      if (velocity < 260) {
        setVelocityBand('slow')
      } else if (velocity < 800) {
        setVelocityBand('medium')
      } else {
        setVelocityBand('fast')
      }

      lastY = y
      lastT = now

      if (velocity > 800 && now > cooldownUntil) {
        if (fastTimer === null) {
          fastTimer = window.setTimeout(() => {
            triggerTransition()
            cooldownUntil = performance.now() + 800
            fastTimer = null
          }, 150)
        }
      } else if (fastTimer !== null) {
        window.clearTimeout(fastTimer)
        fastTimer = null
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (fastTimer !== null) {
        window.clearTimeout(fastTimer)
      }
    }
  }, [setVelocityBand, triggerTransition])

  return useMemo(
    () => ({ currentSection, previousSection }),
    [currentSection, previousSection],
  )
}

export function useSectionNearViewport(sectionId: string, rootMargin = '200px') {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = document.getElementById(sectionId)
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((entry) => entry.isIntersecting))
      },
      {
        rootMargin,
        threshold: 0.01,
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [rootMargin, sectionId])

  return inView
}
