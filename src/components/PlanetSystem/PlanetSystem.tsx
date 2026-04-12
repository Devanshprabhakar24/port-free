import { memo, useEffect, useMemo, useRef } from 'react'
import Planet from '../Planet/Planet'
import { useFlyThroughDepth } from '../../hooks/useFlyThroughDepth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useScrollSectionStore } from '../../store/scrollSectionStore'
import type { SectionId } from '../../store/scrollSectionStore'
const SECTION_IDS: SectionId[] = ['hero', 'about', 'projects', 'contact']

const PLANETS = [
  { name: 'Venus', color: '#c8a050', glow: 'rgba(220,160,60,0.5)', baseSize: 400, cx: 68, cy: 48 },
  { name: 'Earth', color: '#2a7fc7', glow: 'rgba(40,120,200,0.5)', baseSize: 400, cx: 65, cy: 52, earth: true },
  { name: 'Mars', color: '#c1440e', glow: 'rgba(200,60,10,0.5)', baseSize: 360, cx: 70, cy: 50 },
  { name: 'Jupiter', color: '#c88b3a', glow: 'rgba(200,130,50,0.5)', baseSize: 500, cx: 68, cy: 52, bands: true },
  { name: 'Saturn', color: '#d4b86a', glow: 'rgba(210,180,80,0.5)', baseSize: 440, cx: 66, cy: 50, ring: true, bands: true },
  { name: 'Uranus', color: '#7de8e8', glow: 'rgba(80,220,220,0.5)', baseSize: 420, cx: 70, cy: 50 },
  { name: 'Neptune', color: '#3050c8', glow: 'rgba(50,80,200,0.5)', baseSize: 400, cx: 68, cy: 52 },
] as const

function hashString(value: string) {
  let hash = 0

  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  }

  return Math.abs(hash)
}

function createSeededRandom(seed: number) {
  return () => {
    const next = Math.sin(seed += 1) * 10000
    return next - Math.floor(next)
  }
}

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
  const { localTs, progress } = useFlyThroughDepth()
  const setSection = useScrollSectionStore((s) => s.setSection)

  const planetLayouts = useMemo(
    () => PLANETS.map((planet, index) => {
      const random = createSeededRandom(hashString(planet.name) + index * 97)
      const baseX = 58 + random() * 24
      const baseY = 34 + random() * 34
      const driftX = -6 + random() * 12
      const driftY = -5 + random() * 10

      return {
        ...planet,
        cx: baseX,
        cy: baseY,
        driftX,
        driftY,
      }
    }),
    [],
  )

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
    const sectionSize = PLANETS.length / SECTION_IDS.length
    const sectionIndex = Math.min(SECTION_IDS.length - 1, Math.floor(activePlanetIdx / sectionSize))
    setSection(SECTION_IDS[sectionIndex])
  }, [activePlanetIdx, setSection])

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <div className="mobile-gradient-animated absolute inset-0 opacity-70" />
      </div>
    )
  }

  if (reducedMotion) {
    const p = planetLayouts[0]
    return (
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <Planet {...p} size={p.baseSize} cx={window.innerWidth / 2} cy={window.innerHeight / 2} localT={0.5} />
      </div>
    )
  }

  // Keep the first hero frame clean; planets fade in only after slight scroll.
  const introBlend = Math.max(0, Math.min(1, (progress - 0.012) / 0.05))

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '62% 50%',
        opacity: introBlend,
        transition: 'opacity 220ms linear',
      }}
    >
      {planetLayouts.map((p, i) => {
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
        const cx = window.innerWidth * (p.cx / 100) + spxRef.current * parallaxFactor + p.driftX * (0.35 + localT * 0.35)
        const cy = window.innerHeight * (p.cy / 100) + spyRef.current * parallaxFactor + p.driftY * (0.35 + localT * 0.35)

        const t = Math.max(0, Math.min(1.25, localT))
        const prePass = Math.max(0, Math.min(1, t / 0.75))
        const blast = t > 0.75 ? (t - 0.75) / 0.5 : 0
        const zOffset = -260 + prePass * 560 + blast * 440
        const rotateYDeg = spxRef.current * 0.16 + (t - 0.5) * 14
        const tiltXDeg = spyRef.current * -0.12 + (0.5 - t) * 6
        const spinDeg = (i % 2 === 0 ? 1 : -1) * (t * 18)

        return (
          <Planet
            key={p.name + i}
            color={p.color}
            glow={p.glow}
            size={size}
            cx={cx}
            cy={cy}
            zOffset={zOffset}
            rotateYDeg={rotateYDeg}
            tiltXDeg={tiltXDeg}
            spinDeg={spinDeg}
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
