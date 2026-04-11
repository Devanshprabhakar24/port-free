import { motion, useMotionValue, useSpring } from 'framer-motion'
import { memo, useEffect, useMemo } from 'react'
import Planet from '../Planet/Planet'
import DepthIndicator from './DepthIndicator'
import { useCinematicDepthStore } from '../../store/cinematicDepthStore'
import { useScrollSectionStore } from '../../store/scrollSectionStore'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
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

type Orbiter = {
  key: string
  color: string
  glow: string
  size: number
  x: string
  y: string
  ring?: boolean
  tilt?: number
  baseDepth: number
  depthVariance: number
  driftX: number
  driftY: number
}

const SECTION_IDS: SectionId[] = ['hero', 'about', 'projects', 'contact']

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

// Adds four always-on planets so total visible system is 8 planets.
const ORBITERS: Orbiter[] = [
  {
    key: 'mercury',
    color: '#4338ca',
    glow: 'rgba(99,102,241,0.25)',
    size: 170,
    x: '14%',
    y: '24%',
    baseDepth: 0.26,
    depthVariance: 0.14,
    driftX: 22,
    driftY: 16,
  },
  {
    key: 'venus',
    color: '#9a3412',
    glow: 'rgba(251,146,60,0.24)',
    size: 220,
    x: '20%',
    y: '72%',
    ring: true,
    tilt: 16,
    baseDepth: 0.30,
    depthVariance: 0.12,
    driftX: -28,
    driftY: -10,
  },
  {
    key: 'jupiter',
    color: '#1d4ed8',
    glow: 'rgba(59,130,246,0.24)',
    size: 260,
    x: '88%',
    y: '67%',
    baseDepth: 0.32,
    depthVariance: 0.14,
    driftX: 30,
    driftY: 20,
  },
  {
    key: 'neptune',
    color: '#9d174d',
    glow: 'rgba(244,114,182,0.22)',
    size: 190,
    x: '84%',
    y: '34%',
    baseDepth: 0.24,
    depthVariance: 0.14,
    driftX: -24,
    driftY: 14,
  },
]

function PlanetSystem() {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const scrollProgress = useScrollProgress()
  const scrollDirection = useScrollSectionStore((s) => s.scrollDirection)
  const velocityBand = useScrollSectionStore((s) => s.velocityBand)
  const currentSection = useScrollSectionStore((s) => s.currentSection)
  const depths = useCinematicDepthStore((s) => s.depths)

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const parallaxX = useSpring(pointerX, { stiffness: 60, damping: 22, mass: 0.8 })
  const parallaxY = useSpring(pointerY, { stiffness: 60, damping: 22, mass: 0.8 })

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
  const travelY = (scrollProgress - 0.5) * 22

  const motionFactor =
    velocityBand === 'fast'
      ? 1.22
      : velocityBand === 'slow'
        ? 0.9
        : 1

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-5 overflow-hidden">
        <div className="mobile-gradient-animated absolute inset-0 opacity-70" />
        <div className="absolute right-[10%] top-[14%] h-[230px] w-[230px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),rgba(124,58,237,0.38)_45%,rgba(16,12,36,0.2)_80%)] blur-[1px]" />
      </div>
    )
  }

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
      {ORBITERS.map((orbiter, idx) => {
        const wave = 0.5 + 0.5 * Math.sin(scrollProgress * Math.PI * 2 + idx * 1.35)
        const depth = Math.max(0.12, Math.min(0.62, orbiter.baseDepth + (wave - 0.5) * orbiter.depthVariance))
        const dir = scrollDirection === 'down' ? 1 : -1
        const driftX = dir * (scrollProgress - 0.5) * orbiter.driftX * motionFactor
        const driftY = dir * (scrollProgress - 0.5) * orbiter.driftY * motionFactor
        const z = -Math.round((1 - depth) * 320 + 80)

        return (
          <div key={orbiter.key} className="absolute inset-0" style={{ zIndex: 6 + idx }}>
            <div
              className="absolute inset-0"
              style={{
                transform: `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, ${z}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <Planet
                color={orbiter.color}
                glow={orbiter.glow}
                size={orbiter.size}
                x={orbiter.x}
                y={orbiter.y}
                ring={orbiter.ring}
                tilt={orbiter.tilt ?? -12}
                depth={depth}
                isFocused={false}
              />
            </div>
          </div>
        )
      })}

      <div className="absolute inset-0" style={{ transform: `translate3d(0, ${travelY.toFixed(2)}px, 0)` }}>
      {SECTION_IDS.map((id) => {
        const atm = ATMOSPHERES[id]
        const depth = depths[id]
        const focused = id === focusedId
        const focusedIndex = SECTION_IDS.indexOf(focusedId)
        const indexDelta = SECTION_IDS.indexOf(id) - focusedIndex

        const visualDepth = focused
          ? Math.min(1, depth + (1 - maxDepth) * 0.42)
          : Math.max(0.08, depth * 0.72)
        const zIndex = Math.round(visualDepth * 100) + (focused ? 30 : 0)

        const xDrift = indexDelta * 12 * motionFactor
        const yDrift = (1 - visualDepth) * 40 * motionFactor
        const focusedZ = scrollDirection === 'down'
          ? Math.round(visualDepth * 220 * motionFactor)
          : -Math.round(visualDepth * 160 * motionFactor)
        const backgroundZ = -Math.round((1 - visualDepth) * 260 * motionFactor + Math.abs(indexDelta) * 30)

        return (
          <div key={id} className="absolute inset-0" style={{ zIndex }}>
            {focused ? (
              <motion.div className="absolute inset-0" style={{ x: parallaxX, y: parallaxY, z: focusedZ }}>
                <motion.div
                  className="absolute inset-0"
                  animate={{ x: [0, 5, 0], y: [0, -7, 0] }}
                  transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
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
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate3d(${xDrift}px, ${yDrift}px, ${backgroundZ}px)`,
                  transformStyle: 'preserve-3d',
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
      </div>

      <DepthIndicator />
    </div>
  )
}

export default memo(PlanetSystem)
