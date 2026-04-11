import { AnimatePresence, motion } from 'framer-motion'
import { memo, useMemo } from 'react'
import Planet from '../Planet/Planet'
import { useScrollSectionStore } from '../../store/scrollSectionStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

type RouteAtmosphere = {
  color: string
  glow: string
  size: number
  x: string
  y: string
  ring?: boolean
  tilt?: number
  accentLabel: string
}

const SECTION_ATMOSPHERES: Record<string, RouteAtmosphere> = {
  hero: { color: '#3b0764', glow: 'rgba(124,58,237,0.35)', size: 560, x: '73%', y: '20%', ring: false, accentLabel: 'HOME' },
  about: { color: '#1e3a8a', glow: 'rgba(37,99,235,0.34)', size: 440, x: '72%', y: '22%', ring: true, tilt: -18, accentLabel: 'ABOUT' },
  projects: { color: '#831843', glow: 'rgba(236,72,153,0.34)', size: 470, x: '72%', y: '21%', ring: false, accentLabel: 'PROJECTS' },
  contact: { color: '#7f1d1d', glow: 'rgba(220,38,38,0.34)', size: 420, x: '71%', y: '21%', ring: false, accentLabel: 'CONTACT' },
}

const PROFILE = {
  slow: {
    backgroundDuration: 0.98,
    incomingDuration: 0.86,
    incomingX: '12%',
    incomingY: '6%',
    bgX: '6%',
    fgExitY: '-34%',
  },
  medium: {
    backgroundDuration: 0.9,
    incomingDuration: 0.8,
    incomingX: '15%',
    incomingY: '8%',
    bgX: '8%',
    fgExitY: '-40%',
  },
  fast: {
    backgroundDuration: 0.78,
    incomingDuration: 0.66,
    incomingX: '20%',
    incomingY: '10%',
    bgX: '10%',
    fgExitY: '-48%',
  },
} as const

function PlanetSystem() {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const currentSection = useScrollSectionStore((s) => s.currentSection)
  const previousSection = useScrollSectionStore((s) => s.previousSection)
  const velocityBand = useScrollSectionStore((s) => s.velocityBand)

  const active = useMemo(() => SECTION_ATMOSPHERES[currentSection] ?? SECTION_ATMOSPHERES.hero, [currentSection])
  const previous = useMemo(
    () => (previousSection ? SECTION_ATMOSPHERES[previousSection] ?? SECTION_ATMOSPHERES.hero : null),
    [previousSection],
  )
  const profile = PROFILE[velocityBand]

  const backgroundOut = useMemo(
    () => ({ duration: profile.backgroundDuration, ease: [0.4, 0, 0.2, 1] as const }),
    [profile.backgroundDuration],
  )

  const incoming = useMemo(
    () => ({ duration: profile.incomingDuration, ease: [0.22, 1, 0.36, 1] as const }),
    [profile.incomingDuration],
  )

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <div className="mobile-gradient-animated absolute inset-0 opacity-70" />
        <div className="absolute right-[10%] top-[14%] h-[230px] w-[230px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),rgba(124,58,237,0.38)_45%,rgba(16,12,36,0.2)_80%)] blur-[1px]" />
      </div>
    )
  }

  if (reducedMotion) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <Planet
          layoutId="planet-active"
          layout="position"
          color={active.color}
          glow={active.glow}
          size={active.size}
          x={active.x}
          y={active.y}
          ring={active.ring}
          tilt={active.tilt ?? -12}
          label={active.accentLabel}
          isActive={false}
        />
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      <AnimatePresence mode="sync" initial={false}>
        {previous && previousSection !== currentSection ? (
          <motion.div
            key={`bg-${previousSection}`}
            className="absolute inset-0"
            initial={{ scale: 0.7, opacity: 0.25, x: '0%', filter: 'blur(2px)', rotate: -1 }}
            animate={{ scale: 0.5, opacity: 0, x: profile.bgX, filter: 'blur(12px)', rotate: -4 }}
            exit={{ opacity: 0 }}
            transition={backgroundOut}
            style={{ willChange: 'transform, opacity' }}
          >
            <Planet
              layoutId="planet-background"
              layout="position"
              color={previous.color}
              glow={previous.glow}
              size={previous.size}
              x={previous.x}
              y={previous.y}
              ring={previous.ring}
              tilt={previous.tilt ?? -12}
              label={previous.accentLabel}
              opacity={0.32}
              isActive={false}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`fg-${currentSection}`}
          className="absolute inset-0"
          initial={{ scale: 0.6, opacity: 0.2, x: profile.incomingX, y: profile.incomingY, filter: 'blur(6px)', rotate: 3 }}
          animate={{ scale: 1, opacity: 1, x: '0%', y: '0%', filter: 'blur(0px)', rotate: 0 }}
          exit={{ scale: 0.3, opacity: 0, y: profile.fgExitY, filter: 'blur(8px)', rotate: 6 }}
          transition={incoming}
          style={{ willChange: 'transform, opacity' }}
        >
          <Planet
            layoutId="planet-active"
            layout="position"
            color={active.color}
            glow={active.glow}
            size={active.size}
            x={active.x}
            y={active.y}
            ring={active.ring}
            tilt={active.tilt ?? -12}
            label={active.accentLabel}
            isActive={true}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default memo(PlanetSystem)
