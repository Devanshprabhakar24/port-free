import { memo, useEffect, useRef } from 'react'
import { useScrollSectionStore } from '../../store/scrollSectionStore'

function createStars(count: number, minSz: number, maxSz: number, minOp: number, maxOp: number) {
  return Array.from({ length: count }, (_, i) => ({
    left:    `${(i * 37 + 11) % 100}%`,
    top:     `${(i * 53 + 17) % 100}%`,
    size:    minSz + ((i * 29 + 7) % 100) / 100 * (maxSz - minSz),
    opacity: minOp + ((i * 19 + 5) % 100) / 100 * (maxOp - minOp),
    blue:    i % 7 === 0,
  }))
}

// Reduced star counts for performance
const FAR_STARS  = createStars(35, 0.5, 0.9, 0.35, 0.50)
const MID_STARS  = createStars(20, 0.9, 1.4, 0.45, 0.63)
const NEAR_STARS = createStars(10, 1.3, 1.9, 0.60, 0.80)

function Background() {
  const currentSection = useScrollSectionStore((s) => s.currentSection)
  const farRef = useRef<HTMLDivElement>(null)
  const midRef = useRef<HTMLDivElement>(null)
  const nearRef = useRef<HTMLDivElement>(null)
  const streakRef = useRef<HTMLDivElement>(null)
  const vigRef = useRef<HTMLDivElement>(null)
  const streakTimeout = useRef<number | null>(null)

  useEffect(() => {
    return useScrollSectionStore.subscribe(
      (s) => s.velocityBand,
      (band) => {
        const streak = streakRef.current
        const vig = vigRef.current
        if (!streak || !vig) return

        if (band === 'fast') {
          streak.style.transform = 'scaleY(2.5)'
          streak.style.filter = 'blur(1px)'
          streak.style.opacity = String(0.85)
          vig.style.opacity = String(1)
          if (streakTimeout.current) window.clearTimeout(streakTimeout.current)
        } else {
          streakTimeout.current = window.setTimeout(() => {
            if (streak) streak.style.transform = 'scaleY(1)'
            if (streak) streak.style.filter = 'none'
            if (streak) streak.style.opacity = String(1)
            if (vig) vig.style.opacity = String(0)
          }, 350)
        }
      },
    )
  }, [])

  // Star parallax: translateY only
  useEffect(() => {
    let rafId: number | null = null

    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        const progress = window.scrollY / maxScroll
        if (farRef.current) farRef.current.style.transform = `translateY(${(progress * -80).toFixed(1)}px)`
        if (midRef.current) midRef.current.style.transform = `translateY(${(progress * -180).toFixed(1)}px)`
        if (nearRef.current) nearRef.current.style.transform = `translateY(${(progress * -320).toFixed(1)}px)`
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (streakTimeout.current) window.clearTimeout(streakTimeout.current)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#03010a]">
      {/* FAR star layer */}
      <div ref={farRef} className="absolute will-change-transform" style={{ inset: 0, height: '130%', top: '-15%' }}>
        {FAR_STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: s.blue ? 'rgba(200,210,255,0.85)' : 'rgba(255,255,255,0.9)',
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {/* MID star layer */}
      <div ref={midRef} className="absolute will-change-transform" style={{ inset: 0, height: '145%', top: '-22%' }}>
        {MID_STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: s.blue ? 'rgba(180,200,255,0.85)' : 'rgba(255,255,255,0.9)',
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {/* NEAR star layer + streak child */}
      <div ref={nearRef} className="absolute will-change-transform" style={{ inset: 0, height: '165%', top: '-32%' }}>
        <div
          ref={streakRef}
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: '50% 50%',
            transform: 'scaleY(1)',
            transition: 'transform 0.35s ease-out, filter 0.35s ease-out, opacity 0.35s ease-out',
          }}
        >
          {NEAR_STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{ left: s.left, top: s.top, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity }}
            />
          ))}
        </div>
      </div>

      {/* Velocity vignette */}
      <div
        ref={vigRef}
        className="absolute inset-0"
        style={{
          opacity: 0,
          transition: 'opacity 0.35s ease-out',
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.28) 100%)',
        }}
      />

      {/* Nebula gradient overlays — static, no animation cost */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.08),transparent_25%)]" />

      {/* Nebula clouds — CSS animation instead of Framer Motion JS loop */}
      <div
        className="absolute -left-[40px] -top-[60px] h-[300px] w-[400px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 40% 40%, rgba(88,28,135,0.2) 0%, transparent 70%)',
          animation: 'nebulaPulse1 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-[-40px] right-[30%] h-[280px] w-[350px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(30,58,138,0.15) 0%, transparent 70%)',
          animation: 'nebulaPulse2 14s ease-in-out infinite',
        }}
      />

      {/* Pulsing bright star — CSS animation */}
      <div
        className="absolute right-[12%] top-[22%] h-3 w-3 rounded-full bg-white/80"
        style={{
          boxShadow: '0 0 24px rgba(255,255,255,0.6)',
          opacity: currentSection === 'projects' ? 0 : 1,
          transition: 'opacity 0.5s ease',
          animation: 'starPulse 5.5s ease-in-out infinite',
        }}
      />

      {/* Purple grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.9,
        }}
      />
    </div>
  )
}

export default memo(Background)
