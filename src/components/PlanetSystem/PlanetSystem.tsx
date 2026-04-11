import { motion, useMotionValue, useSpring } from 'framer-motion'
import { memo, useEffect, useMemo } from 'react'
import Planet from '../Planet/Planet'
import DepthIndicator from './DepthIndicator'
import { useCinematicDepthStore } from '../../store/cinematicDepthStore'
import { useScrollDepth } from '../../hooks/useScrollDepth'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useScrollSectionStore } from '../../store/scrollSectionStore'
import type { SectionId } from '../../store/scrollSectionStore'
import { AMBIENT_ORBITERS } from './orbiters'

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


function PlanetSystem() {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const currentSection = useScrollSectionStore((s) => s.currentSection)
  const velocityBand = useScrollSectionStore((s) => s.velocityBand)
  const setDepths = useCinematicDepthStore((s) => s.setDepths)
  const depths = useScrollDepth()
  const scrollProgress = useScrollProgress()

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const parallaxX = useSpring(pointerX, { stiffness: 56, damping: 21, mass: 0.85 })
  const parallaxY = useSpring(pointerY, { stiffness: 56, damping: 21, mass: 0.85 })

  const speedFactor = velocityBand === 'fast' ? 1.42 : velocityBand === 'slow' ? 0.9 : 1.12

  useEffect(() => {
    setDepths(depths)
  }, [depths, setDepths])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      pointerX.set(nx * 12)
      pointerY.set(ny * 9)
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
  const phase = scrollProgress * 2 - 1

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
      style={{ perspective: '1400px', perspectiveOrigin: '50% 38%', transformStyle: 'preserve-3d' }}
    >
      {AMBIENT_ORBITERS.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute inset-0"
          style={{ zIndex: Math.round(orb.baseDepth * 100) }}
          animate={{
            x: [0, orb.floatAmpX, 0, -orb.floatAmpX, 0],
            y: [0, -orb.floatAmpY, 0, orb.floatAmpY, 0],
          }}
          transition={{
            duration: orb.floatDuration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.floatDelay,
          }}
        >
          <Planet
            color={orb.color} glow={orb.glow}
            size={orb.size} x={orb.x} y={orb.y}
            ring={orb.ring} tilt={orb.tilt ?? -12}
            depth={orb.baseDepth}
            isFocused={false}
          />
        </motion.div>
      ))}

      {SECTION_IDS.map((id) => {
        const atm = ATMOSPHERES[id]
        const depth = depths[id]
        const focused = id === focusedId
        const focusedIndex = SECTION_IDS.indexOf(focusedId)
        const indexDelta = SECTION_IDS.indexOf(id) - focusedIndex

        const visualDepth = focused
          ? Math.min(1, depth + (1 - maxDepth) * 0.55)
          : Math.max(0.08, depth * 0.68)

        const zIndex = Math.round(visualDepth * 130) + (focused ? 48 : 0)
        const xDrift = indexDelta * 14 * speedFactor
        const yDrift = (1 - visualDepth) * 55 * speedFactor
        const focusedZ = Math.round(visualDepth * 340 * speedFactor + phase * 260)
        const focusedTravelX = phase * 148 * speedFactor
        const focusedTravelY = -phase * 186 * speedFactor
        const focusedTilt = phase * 9
        const backgroundZ = -Math.round((1 - visualDepth) * 300 * speedFactor + Math.abs(indexDelta) * 38)

        return (
          <div key={id} className="absolute inset-0" style={{ zIndex }}>
            {focused ? (
              <motion.div className="absolute inset-0" style={{ x: parallaxX, y: parallaxY }}>
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `translate3d(${focusedTravelX.toFixed(2)}px, ${focusedTravelY.toFixed(2)}px, ${focusedZ}px) rotate(${focusedTilt.toFixed(2)}deg)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{ x: [0, 10, 0], y: [0, -16, 0] }}
                    transition={{ duration: 13, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
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
                </div>
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

      <DepthIndicator />
    </div>
  )
}

export default memo(PlanetSystem)
