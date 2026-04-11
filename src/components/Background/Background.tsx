import { motion } from 'framer-motion'
import { memo, useEffect, useRef } from 'react'
import { useScrollSectionStore } from '../../store/scrollSectionStore'

type Star = {
  left: number
  top: number
  size: number
  opacity: number
}

function createStars(
  count: number,
  minSize: number,
  maxSize: number,
  minOpacity: number,
  maxOpacity: number,
  maxTop = 100,
): Star[] {
  return Array.from({ length: count }, (_, index) => {
    const leftSeed = (index * 37 + 11) % 100
    const topSeed = (index * 53 + 17) % 100
    const sizeSeed = (index * 29 + 7) % 100
    const opacitySeed = (index * 19 + 5) % 100

    return {
      left: leftSeed,
      top: (topSeed / 100) * maxTop,
      size: minSize + (sizeSeed / 100) * (maxSize - minSize),
      opacity: minOpacity + (opacitySeed / 100) * (maxOpacity - minOpacity),
    }
  })
}

const FAR_STARS = createStars(60, 0.5, 0.9, 0.35, 0.5, 130)
const MID_STARS = createStars(35, 0.9, 1.4, 0.45, 0.63, 145)
const NEAR_STARS = createStars(18, 1.3, 1.9, 0.6, 0.8, 165)

function Background() {
  const velocityBand = useScrollSectionStore((s) => s.velocityBand)
  const scrollDirection = useScrollSectionStore((s) => s.scrollDirection)

  const farLayerRef = useRef<HTMLDivElement | null>(null)
  const midLayerRef = useRef<HTMLDivElement | null>(null)
  const nearLayerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let rafId = 0
    let targetProgress = 0
    let smoothProgress = 0

    const recalcTarget = () => {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      targetProgress = Math.max(0, Math.min(1, window.scrollY / scrollable))
    }

    const tick = () => {
      smoothProgress += (targetProgress - smoothProgress) * 0.12
      const dir = scrollDirection === 'down' ? 1 : -1

      const farX = (smoothProgress - 0.5) * 16 * dir
      const midX = (smoothProgress - 0.5) * 28 * dir
      const nearX = (smoothProgress - 0.5) * 42 * dir

      if (farLayerRef.current) {
        farLayerRef.current.style.transform = `translate3d(${farX.toFixed(2)}px, ${(-smoothProgress * 80).toFixed(2)}px, 0)`
      }
      if (midLayerRef.current) {
        midLayerRef.current.style.transform = `translate3d(${midX.toFixed(2)}px, ${(-smoothProgress * 180).toFixed(2)}px, 0)`
      }
      if (nearLayerRef.current) {
        nearLayerRef.current.style.transform = `translate3d(${nearX.toFixed(2)}px, ${(-smoothProgress * 320).toFixed(2)}px, 0)`
      }

      rafId = window.requestAnimationFrame(tick)
    }

    recalcTarget()
    rafId = window.requestAnimationFrame(tick)
    window.addEventListener('scroll', recalcTarget, { passive: true })
    window.addEventListener('resize', recalcTarget)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', recalcTarget)
      window.removeEventListener('resize', recalcTarget)
    }
  }, [scrollDirection])

  const streaking = velocityBand === 'fast'

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#03010a]">
      <div ref={farLayerRef} className="absolute -top-[15%] left-0 h-[130%] w-full will-change-transform">
        {FAR_STARS.map((star, index) => (
          <span
            key={`far-${index}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div ref={midLayerRef} className="absolute -top-[22.5%] left-0 h-[145%] w-full will-change-transform">
        {MID_STARS.map((star, index) => (
          <span
            key={`mid-${index}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div
        ref={nearLayerRef}
        className="absolute -top-[32.5%] left-0 h-[165%] w-full will-change-transform"
        style={{
          transform: streaking ? 'scaleY(2.5)' : 'scaleY(1)',
          transformOrigin: 'center center',
          transition: 'transform 350ms ease',
        }}
      >
        {NEAR_STARS.map((star, index) => (
          <span
            key={`near-${index}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.9,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.08),transparent_25%)]" />

      <motion.div
        className="absolute -left-10 -top-15 h-75 w-100 rounded-full will-change-transform"
        animate={{ opacity: [0.7, 1, 0.75], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          y: -24,
          background: 'radial-gradient(ellipse at 40% 40%, rgba(88,28,135,0.2) 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="absolute -bottom-10 right-[30%] h-70 w-87.5 rounded-full will-change-transform"
        animate={{ opacity: [0.55, 0.95, 0.6], scale: [1, 1.04, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          y: -12,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(30,58,138,0.15) 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="absolute right-[12%] top-[22%] h-3 w-3 rounded-full bg-white/80"
        animate={{ scale: [1, 1.5, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ boxShadow: '0 0 24px rgba(255,255,255,0.6)' }}
      />

      <div
        className="absolute inset-0"
        style={{
          opacity: streaking ? 0.25 : 0,
          transition: 'opacity 350ms ease',
          background: 'radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  )
}

export default memo(Background)
