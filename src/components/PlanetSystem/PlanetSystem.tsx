import { motion, useMotionValue, useSpring } from 'framer-motion'
import { memo, useEffect, useMemo } from 'react'
import Planet from '../Planet/Planet'
import { useScrollSectionStore } from '../../store/scrollSectionStore'
import { useCinematicDepthStore } from '../../store/cinematicDepthStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import DepthIndicator from './DepthIndicator'
import type { SectionId } from '../../store/scrollSectionStore'

type Atmosphere = {
  color: string
  glow: string
  size: number
  x: string
  y: string
  ring?: boolean
  tilt?: number
  label: string
}

const ATMOSPHERES: Record<SectionId, Atmosphere> = {
  hero: {
    color: '#3b0764',
    glow: 'rgba(124,58,237,0.38)',
    size: 560,
    x: '73%',
    y: '20%',
    ring: false,
    label: 'HOME',
  },
  about: {
    color: '#0f2860',
    glow: 'rgba(37,99,235,0.38)',
    size: 460,
    x: '72%',
    y: '22%',
    ring: true,
    tilt: -18,
    label: 'ABOUT',
  },
  projects: {
    color: '#6b0f36',
    glow: 'rgba(236,72,153,0.38)',
    size: 490,
    x: '72%',
    y: '21%',
    ring: false,
    label: 'PROJECTS',
  },
  contact: {
    color: '#6b1010',
    glow: 'rgba(220,38,38,0.38)',
    size: 430,
    x: '71%',
    y: '21%',
    ring: false,
    label: 'CONTACT',
  },
}

const SECTION_IDS: SectionId[] = ['hero', 'about', 'projects', 'contact']

function PlanetSystem() {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const currentSection = useScrollSectionStore((s) => s.currentSection)
  const depths = useCinematicDepthStore((s) => s.depths)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const parallaxX = useSpring(pointerX, { stiffness: 55, damping: 20, mass: 0.8 })
  const parallaxY = useSpring(pointerY, { stiffness: 55, damping: 20, mass: 0.8 })

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      pointerX.set(nx * 10)
      pointerY.set(ny * 8)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [pointerX, pointerY])

  const focusedId = useMemo(
    () => SECTION_IDS.reduce((best, id) => (depths[id] > depths[best] ? id : best), currentSection),
    [depths, currentSection],
  )
  const maxDepth = depths[focusedId]

  // Mobile: simple static blob, no computation
  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-5 overflow-hidden">
        <div className="mobile-gradient-animated absolute inset-0 opacity-70" />
        <div className="absolute right-[10%] top-[14%] h-[230px] w-[230px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),rgba(124,58,237,0.38)_45%,rgba(16,12,36,0.2)_80%)] blur-[1px]" />
      </div>
    )
  }

  // Reduced motion: only active planet, no depth animation
  if (reducedMotion) {
    const atm = ATMOSPHERES[currentSection]
    return (
      <div className="pointer-events-none fixed inset-0 z-5 overflow-hidden">
        <Planet
          color={atm.color}
          glow={atm.glow}
          size={atm.size}
          x={atm.x}
          y={atm.y}
          ring={atm.ring}
          tilt={atm.tilt ?? -12}
          label={atm.label}
          depth={1}
          isFocused={true}
        />
      </div>
    )
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-5 overflow-hidden"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 40%' }}
    >
      {SECTION_IDS.map((id) => {
        const atm = ATMOSPHERES[id]
        const depth = depths[id]
        const focused = id === focusedId
        const visualDepth = focused
          ? Math.min(1, depth + (1 - maxDepth) * 0.45)
          : Math.max(0, depth * 0.78)
        const zIndex = Math.round(visualDepth * 100) + (focused ? 20 : 0)
        const focusedIndex = SECTION_IDS.indexOf(focusedId)
        const indexDelta = SECTION_IDS.indexOf(id) - focusedIndex
        const xDrift = indexDelta * 12
        const yDrift = (1 - visualDepth) * 40

        return (
          <div key={id} className="absolute inset-0" style={{ zIndex }}>
            {focused ? (
              // Focused planet gets the ambient float animation
              <motion.div
                className="absolute inset-0"
                style={{ x: parallaxX, y: parallaxY }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    x: [0, 5, 0],
                    y: [0, -7, 0],
                  }}
                  transition={{
                    duration: 16,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }}
                >
                  <Planet
                    color={atm.color}
                    glow={atm.glow}
                    size={atm.size}
                    x={atm.x}
                    y={atm.y}
                    ring={atm.ring}
                    tilt={atm.tilt ?? -12}
                    label={atm.label}
                    depth={visualDepth}
                    isFocused={true}
                  />
                </motion.div>
              </motion.div>
            ) : (
              // Background planets: no float, just depth-driven scale/opacity
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate3d(${xDrift}px, ${yDrift}px, 0)`,
                }}
              >
                <Planet
                  color={atm.color}
                  glow={atm.glow}
                  size={atm.size}
                  x={atm.x}
                  y={atm.y}
                  ring={atm.ring}
                  tilt={atm.tilt ?? -12}
                  label={atm.label}
                  depth={visualDepth}
                  isFocused={false}
                />
              </div>
            )}
          </div>
        )
      })}
      <DepthIndicator />
    </div>
  )
}

export default memo(PlanetSystem)