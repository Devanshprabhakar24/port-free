import { AnimatePresence, motion } from 'framer-motion'
import { memo, useMemo } from 'react'
import Planet from '../Planet/Planet'
import { useNavigationStore } from '../../store/navigationStore'

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

const ATMOSPHERES: Record<string, RouteAtmosphere> = {
  '/': { color: '#3b0764', glow: 'rgba(124,58,237,0.35)', size: 560, x: '73%', y: '20%', ring: false, accentLabel: 'HOME' },
  '/about': { color: '#1e3a8a', glow: 'rgba(37,99,235,0.34)', size: 440, x: '72%', y: '22%', ring: true, tilt: -18, accentLabel: 'ABOUT' },
  '/dashboard': { color: '#14532d', glow: 'rgba(34,197,94,0.28)', size: 500, x: '70%', y: '23%', ring: true, tilt: -16, accentLabel: 'DASHBOARD' },
  '/projects': { color: '#831843', glow: 'rgba(236,72,153,0.34)', size: 470, x: '72%', y: '21%', ring: false, accentLabel: 'PROJECTS' },
  '/contact': { color: '#7f1d1d', glow: 'rgba(220,38,38,0.34)', size: 420, x: '71%', y: '21%', ring: false, accentLabel: 'CONTACT' },
}

const transition = { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const }

function PlanetSystem() {
  const activePath = useNavigationStore((s) => s.activePath)
  const previousPath = useNavigationStore((s) => s.previousPath)
  const previewPath = useNavigationStore((s) => s.previewPath)

  const active = useMemo(() => ATMOSPHERES[activePath] ?? ATMOSPHERES['/'], [activePath])
  const previous = useMemo(
    () => (previousPath ? ATMOSPHERES[previousPath] ?? ATMOSPHERES['/'] : null),
    [previousPath],
  )
  const preview = useMemo(
    () => (previewPath ? ATMOSPHERES[previewPath] ?? ATMOSPHERES['/'] : null),
    [previewPath],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      <AnimatePresence mode="sync" initial={false}>
        {preview && previewPath !== activePath ? (
          <motion.div
            key={`preview-${previewPath}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.8, rotate: -4, x: 120, y: 28 }}
            animate={{ opacity: 0.42, scale: 0.9, rotate: -2, x: 42, y: 10 }}
            exit={{ opacity: 0, scale: 1.06, rotate: 0, x: 0, y: 0 }}
            transition={transition}
          >
            <Planet
              layoutId="planet-preview"
              layout="position"
              color={preview.color}
              glow={preview.glow}
              size={preview.size * 0.9}
              x={preview.x}
              y={preview.y}
              ring={preview.ring}
              tilt={preview.tilt ?? -12}
              label={`${preview.accentLabel} PREVIEW`}
              opacity={0.56}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="sync" initial={false}>
        {previous && previousPath !== activePath ? (
          <motion.div
            key={`previous-${previousPath}`}
            className="absolute inset-0"
            initial={{ opacity: 0.86, scale: 1, rotate: 0, x: 0, y: 0 }}
            animate={{ opacity: 0.5, scale: 0.88, rotate: -3, x: -30, y: 14 }}
            exit={{ opacity: 0, scale: 0.76, rotate: -8, x: -96, y: 34 }}
            transition={transition}
          >
            <Planet
              layoutId="planet-previous"
              layout="position"
              color={previous.color}
              glow={previous.glow}
              size={previous.size}
              x={previous.x}
              y={previous.y}
              ring={previous.ring}
              tilt={previous.tilt ?? -12}
              label={previous.accentLabel}
              opacity={0.58}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`active-${activePath}`}
          className="absolute inset-0"
          initial={{ opacity: 0.66, scale: 0.86, rotate: 4, x: 112, y: 30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }}
          exit={{ opacity: 0.54, scale: 1.12, rotate: 5, x: -40, y: -14 }}
          transition={transition}
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
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default memo(PlanetSystem)
