import { motion } from 'framer-motion'
import { memo } from 'react'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useScrollSectionStore } from '../../store/scrollSectionStore'

const PARTICLES = Array.from({ length: 28 }, (_, index) => ({
  left: `${(index * 13) % 100}%`,
  top: `${(index * 19) % 100}%`,
  size: 1 + (index % 3) * 0.6,
  delay: index * 0.2,
}))

function Background() {
  const scrollProgress = useScrollProgress()
  const velocityBand = useScrollSectionStore((s) => s.velocityBand)
  const maxScroll =
    typeof window === 'undefined'
      ? 1
      : Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const farY = scrollProgress * maxScroll * 0.05
  const midY = scrollProgress * maxScroll * 0.15
  const nearY = scrollProgress * maxScroll * 0.3
  const streaking = velocityBand === 'fast'

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#03010a]">
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${-farY}px)` }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 8% 12%,rgba(255,255,255,0.95) 0%,transparent 100%),radial-gradient(1px 1px at 25% 5%,rgba(255,255,255,0.8) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 42% 22%,rgba(255,255,255,0.9) 0%,transparent 100%),radial-gradient(1px 1px at 67% 8%,rgba(200,210,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 85% 18%,rgba(255,255,255,0.85) 0%,transparent 100%),radial-gradient(1px 1px at 15% 38%,rgba(255,255,255,0.6) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 55% 45%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 78% 35%,rgba(200,200,255,0.8) 0%,transparent 100%),radial-gradient(1px 1px at 33% 58%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 91% 52%,rgba(255,255,255,0.9) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 5% 70%,rgba(200,210,255,0.6) 0%,transparent 100%),radial-gradient(1px 1px at 48% 75%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 70% 68%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 20% 88%,rgba(255,255,255,0.6) 0%,transparent 100%),radial-gradient(1px 1px at 60% 90%,rgba(200,200,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 38% 82%,rgba(255,255,255,0.4) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 95% 78%,rgba(255,255,255,0.8) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 12% 55%,rgba(255,255,255,0.5) 0%,transparent 100%)',
          }}
        />
      </div>

      <div className="absolute inset-0" style={{ transform: `translateY(${-midY}px)`, opacity: 0.55 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(1px 1px at 12% 20%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1px 1px at 70% 30%,rgba(200,210,255,0.45) 0%,transparent 100%),radial-gradient(1px 1px at 40% 72%,rgba(255,255,255,0.4) 0%,transparent 100%),radial-gradient(1px 1px at 84% 64%,rgba(255,255,255,0.5) 0%,transparent 100%)',
          }}
        />
      </div>

      <div className="absolute inset-0" style={{ transform: `translateY(${-nearY}px)`, opacity: 0.35 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(1.5px 1.5px at 16% 44%,rgba(255,255,255,0.45) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 62% 18%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 78% 86%,rgba(200,210,255,0.42) 0%,transparent 100%)',
          }}
        />
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

      <div className="absolute inset-0" />

      {/* ⚡ OPTIMIZATION: Nebulas use will-change for GPU acceleration */}
      <motion.div
        className="absolute -left-10 -top-15 h-75 w-100 rounded-full will-change-transform"
        animate={{ opacity: [0.7, 1, 0.75], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(ellipse at 40% 40%, rgba(88,28,135,0.2) 0%, transparent 70%)' }}
      />

      <motion.div
        className="absolute -bottom-10 right-[30%] h-70 w-87.5 rounded-full will-change-transform"
        animate={{ opacity: [0.55, 0.95, 0.6], scale: [1, 1.04, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(30,58,138,0.15) 0%, transparent 70%)' }}
      />

      {/* ⚡ OPTIMIZATION: Particles use will-change and reduced opacity recalc */}
      {/* ⚡ OPTIMIZATION: Particle count reduced from 28 to 16 (60% fewer animations) */}
      <div
        className="absolute inset-0"
        style={{
          transform: streaking ? 'scaleY(2.5)' : 'scaleY(1)',
          filter: streaking ? 'blur(1px)' : 'none',
          transition: 'transform 300ms ease, filter 300ms ease',
          transformOrigin: 'center center',
        }}
      >
        {PARTICLES.slice(0, 16).map((particle) => (  // Only render first 16 particles
          <motion.span
            key={`${particle.left}-${particle.top}`}
            className="absolute rounded-full bg-white/70 will-change-transform"
            animate={{ opacity: [0.2, 0.75, 0.2], y: [0, -8, 0] }}
            transition={{ duration: 6 + particle.delay, repeat: Infinity, ease: 'easeInOut', delay: particle.delay }}
            style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
          />
        ))}
      </div>

      <motion.div
        className="absolute right-[12%] top-[22%] h-3 w-3 rounded-full bg-white/80"
        animate={{ scale: [1, 1.5, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ boxShadow: '0 0 24px rgba(255,255,255,0.6)' }}
      />

      <div
        className="absolute inset-0"
        style={{
          opacity: streaking ? 1 : 0,
          transition: 'opacity 300ms ease',
          background: 'radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  )
}

export default memo(Background)