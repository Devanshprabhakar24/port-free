import { AnimatePresence, motion } from 'framer-motion'
import { memo, useMemo } from 'react'
import Planet from '../Planet/Planet'
import { useScrollSectionStore } from '../../store/scrollSectionStore'
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

// Duration by velocity band
const EXIT_DURATION = { slow: 0.85, medium: 0.72, fast: 0.55 }
const ENTER_DURATION = { slow: 1.0, medium: 0.85, fast: 0.65 }

// Spring for incoming planet — heavy orbital mass feel
const ENTRY_SPRING = { type: 'spring' as const, stiffness: 55, damping: 16, mass: 1.1 }

function PlanetSystem() {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const currentSection = useScrollSectionStore((s) => s.currentSection)
  const previousSection = useScrollSectionStore((s) => s.previousSection)
  const velocityBand = useScrollSectionStore((s) => s.velocityBand)
  const scrollDirection = useScrollSectionStore((s) => s.scrollDirection)

  const active = ATMOSPHERES[currentSection]
  const previous = useMemo(
    () => (previousSection !== currentSection ? ATMOSPHERES[previousSection] : null),
    [previousSection, currentSection],
  )

  // Direction-aware Y offsets in pixels (applied to planet wrapper, not viewport div)
  const enterY = scrollDirection === 'down' ? 100 : -100 // where new planet starts
  const exitY = scrollDirection === 'down' ? -120 : 120 // where old planet exits to

  const exitDuration = EXIT_DURATION[velocityBand]
  const enterDuration = ENTER_DURATION[velocityBand]

  // Mobile: simple gradient blob
  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <div className="mobile-gradient-animated absolute inset-0 opacity-70" />
        <div className="absolute right-[10%] top-[14%] h-[230px] w-[230px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),rgba(124,58,237,0.38)_45%,rgba(16,12,36,0.2)_80%)] blur-[1px]" />
      </div>
    )
  }

  // Reduced motion: static planet, no animation
  if (reducedMotion) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <Planet
          color={active.color}
          glow={active.glow}
          size={active.size}
          x={active.x}
          y={active.y}
          ring={active.ring}
          tilt={active.tilt ?? -12}
          label={active.label}
        />
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">

      {/* ── OUTGOING planet — flies past camera ── */}
      <AnimatePresence mode="popLayout">
        {previous ? (
          <motion.div
            key={`exit-${previousSection}`}
            className="absolute inset-0"
            style={{ willChange: 'transform, opacity, filter' }}
            initial={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
            animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{
              scale: 1.6,
              opacity: 0,
              y: exitY,
              filter: 'blur(16px)',
              transition: {
                duration: exitDuration,
                ease: [0.4, 0, 1, 1],
              },
            }}
          >
            <Planet
              color={previous.color}
              glow={previous.glow}
              size={previous.size}
              x={previous.x}
              y={previous.y}
              ring={previous.ring}
              tilt={previous.tilt ?? -12}
              opacity={1}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── INCOMING planet — approaches from deep space ── */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`enter-${currentSection}`}
          className="absolute inset-0"
          style={{ willChange: 'transform, opacity, filter' }}
          initial={{
            scale: 0.32,
            opacity: 0,
            y: enterY,
            filter: 'blur(22px)',
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
              ...ENTRY_SPRING,
              opacity: { duration: enterDuration * 0.55, ease: 'easeOut' },
              filter: { duration: enterDuration * 0.7, ease: 'easeOut' },
            },
          }}
        >
          {/* Ambient orbital float — separate from entry, no conflict */}
          <motion.div
            className="absolute inset-0"
            animate={{
              x: [0, 4, 0],
              y: [0, -6, 0],
              scale: [1, 1.022, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          >
            <Planet
              color={active.color}
              glow={active.glow}
              size={active.size}
              x={active.x}
              y={active.y}
              ring={active.ring}
              tilt={active.tilt ?? -12}
              label={active.label}
              opacity={1}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

    </div>
  )
}

export default memo(PlanetSystem)