/**
 * DepthIndicator
 * Bottom-right HUD showing scroll depth bars for each section.
 * Reads directly from the DOM (same source as the rAF loop in CinematicBackground)
 * to avoid needing the cinematicDepthStore being fed externally.
 */
import { memo, useEffect, useState } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { SectionId } from '../../store/scrollSectionStore'

const SECTION_IDS: SectionId[] = ['hero', 'about', 'projects', 'contact']

function calcDepths(): Record<SectionId, number> {
  const vh = window.innerHeight
  const result = {} as Record<SectionId, number>
  SECTION_IDS.forEach((id) => {
    const el = document.getElementById(id)
    if (!el) { result[id] = 0; return }
    const rect = el.getBoundingClientRect()
    const dist = Math.abs((rect.top + rect.height / 2) - vh / 2)
    result[id] = Math.max(0, 1 - dist / (vh * 0.8))
  })
  return result
}

function DepthIndicator() {
  const isMobile = useIsMobile()
  const [visible, setVisible] = useState(false)
  const [depths, setDepths] = useState<Record<SectionId, number>>({ hero: 1, about: 0, services: 0, projects: 0, contact: 0 })

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (isMobile) return
    let lastRaf: number | null = null

    const onScroll = () => {
      if (lastRaf !== null) return
      lastRaf = requestAnimationFrame(() => {
        lastRaf = null
        setDepths(calcDepths())
      })
    }

    setDepths(calcDepths())
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (lastRaf !== null) cancelAnimationFrame(lastRaf)
    }
  }, [isMobile])

  if (isMobile) return null

  const focused = SECTION_IDS.reduce((best, id) => (depths[id] > depths[best] ? id : best), 'hero' as SectionId)

  return (
    <div
      className="pointer-events-none fixed bottom-7 right-7 z-[22]"
      style={{ opacity: visible ? 0.45 : 0, transition: 'opacity 420ms ease' }}
      aria-hidden="true"
    >
      <div className="mb-3 text-right font-mono text-[9px] uppercase tracking-[0.24em] text-white/50">
        {focused}
      </div>
      <div className="flex items-end gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-3 backdrop-blur-md">
        {SECTION_IDS.map((id) => {
          const depth = depths[id]
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <div className="relative h-12 w-[3px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-full bg-white/70"
                  style={{ height: `${Math.max(6, depth * 48)}px` }}
                />
              </div>
              <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/45">{id[0]}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(DepthIndicator)
