import { memo, useEffect, useMemo, useRef } from 'react'
import Planet from '../Planet/Planet'
import { useFlyThroughDepth } from '../../hooks/useFlyThroughDepth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useScrollSectionStore } from '../../store/scrollSectionStore'
import type { SectionId } from '../../store/scrollSectionStore'
const SECTION_IDS: SectionId[] = ['hero', 'about', 'projects', 'contact']

const PLANETS = [
  { name: 'Mercury', color: '#888888', glow: 'rgba(180,180,180,0.5)', baseSize: 340, cx: 50, cy: 50 },
  { name: 'Venus', color: '#c8a050', glow: 'rgba(220,160,60,0.5)', baseSize: 440, cx: 55, cy: 45 },
  { name: 'Earth', color: '#2a7fc7', glow: 'rgba(40,120,200,0.5)', baseSize: 420, cx: 48, cy: 52, earth: true },
  { name: 'Mars', color: '#c1440e', glow: 'rgba(200,60,10,0.5)', baseSize: 380, cx: 52, cy: 48 },
  { name: 'Jupiter', color: '#c88b3a', glow: 'rgba(200,130,50,0.5)', baseSize: 560, cx: 50, cy: 50, bands: true },
  { name: 'Saturn', color: '#d4b86a', glow: 'rgba(210,180,80,0.5)', baseSize: 500, cx: 50, cy: 50, ring: true, bands: true },
  { name: 'Uranus', color: '#7de8e8', glow: 'rgba(80,220,220,0.5)', baseSize: 460, cx: 50, cy: 50 },
  { name: 'Neptune', color: '#3050c8', glow: 'rgba(50,80,200,0.5)', baseSize: 440, cx: 50, cy: 50 },
] as const

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function easeIn(t: number) {
  return t * t * t
}

function getScale(localT: number): number {
  if (localT <= 0) return 0.04
  if (localT < 0.35) return 0.04 + easeOut(localT / 0.35) * 0.86
  if (localT < 0.55) return 0.90 + easeIn((localT - 0.35) / 0.20) * 0.40
  if (localT < 0.75) return 1.30 + easeIn((localT - 0.55) / 0.20) * 1.80
  return 3.10 + easeIn((localT - 0.75) / 0.25) * 5.0
}

function PlanetSystem() {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const { localTs } = useFlyThroughDepth()
  const setSection = useScrollSectionStore((s) => s.setSection)

  const pmxRef = useRef(0)
  const pmyRef = useRef(0)
  const spxRef = useRef(0)
  const spyRef = useRef(0)

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      pmxRef.current = (event.clientX / window.innerWidth - 0.5) * 16
      pmyRef.current = (event.clientY / window.innerHeight - 0.5) * 10
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  useEffect(() => {
    let raf = 0
    const loop = () => {
      spxRef.current += (pmxRef.current - spxRef.current) * 0.06
      spyRef.current += (pmyRef.current - spyRef.current) * 0.06
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const activePlanetIdx = useMemo(
    () => localTs.findIndex((t) => t >= 0.25 && t <= 0.75),
    [localTs],
  )

  useEffect(() => {
    if (activePlanetIdx < 0) return
    const sectionIndex = Math.min(SECTION_IDS.length - 1, Math.floor(activePlanetIdx / 2))
    setSection(SECTION_IDS[sectionIndex])
  }, [activePlanetIdx, setSection])

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[14] overflow-hidden">
        <div className="mobile-gradient-animated absolute inset-0 opacity-70" />
      </div>
    )
  }

  if (reducedMotion) {
    const p = PLANETS[0]
    return (
      <div className="pointer-events-none fixed inset-0 z-[14] overflow-hidden">
        <Planet {...p} size={p.baseSize} cx={window.innerWidth / 2} cy={window.innerHeight / 2} localT={0.5} />
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[14] overflow-hidden">
      {PLANETS.map((p, i) => {
        // OVERLAP must match OVERLAP in useFlyThroughDepth (0.35)
        const overlap = 0.35
        const localT = (localTs[i] ?? -0.5) + overlap
        // Keep slightly wider than OVERLAP so there's always at least one planet on screen
        const visible = localT >= -(overlap + 0.05) && localT <= 1 + overlap + 0.05
        if (!visible) {
          return <div key={p.name + i} style={{ display: 'none' }} />
        }

        const vw = window.innerWidth
        const vh = window.innerHeight
        const scaleFactor = Math.min(1, vw / 1440)
        const scale = getScale(localT)
        // Cap at 2× viewport diagonal so the planet fills screen smoothly before fading
        const maxSize = Math.sqrt(vw * vw + vh * vh) * 2
        const size = Math.min(p.baseSize * scale * scaleFactor, maxSize)

        const parallaxFactor = Math.max(0, 1 - Math.max(0, localT - 0.5) * 2)
        const cx = window.innerWidth * (p.cx / 100) + spxRef.current * parallaxFactor
        const cy = window.innerHeight * (p.cy / 100) + spyRef.current * parallaxFactor

        return (
          <Planet
            key={p.name + i}
            color={p.color}
            glow={p.glow}
            size={size}
            cx={cx}
            cy={cy}
            ring={'ring' in p ? p.ring : false}
            bands={'bands' in p ? p.bands : false}
            earth={'earth' in p ? p.earth : false}
            label={p.name}
            localT={localT}
          />
        )
      })}
    </div>
  )
}

export default memo(PlanetSystem)
