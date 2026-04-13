import { memo } from 'react'
import { motion } from 'framer-motion'
import { lazy, Suspense, useMemo } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import type { MousePosition } from '../../hooks/useMousePosition'
import { useDetectWebGL } from '../../hooks/useDetectWebGL'

const HeroScene = lazy(() => import('./HeroScene'))

type HeroProps = {
  mouse: MousePosition
  onViewProjects: () => void
  shouldRenderScene?: boolean
}

function Hero({ mouse, onViewProjects, shouldRenderScene = true }: HeroProps) {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const scrollProgress = useScrollProgress()
  const webGLReady = useDetectWebGL()

  const mobileStyle = useMemo(
    () => ({
      filter: `hue-rotate(${Math.round(scrollProgress * 90)}deg)`,
    }),
    [scrollProgress],
  )

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#03010a]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 8% 12%,rgba(255,255,255,0.95) 0%,transparent 100%),radial-gradient(1px 1px at 25% 5%,rgba(255,255,255,0.8) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 42% 22%,rgba(255,255,255,0.9) 0%,transparent 100%),radial-gradient(1px 1px at 67% 8%,rgba(200,210,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 85% 18%,rgba(255,255,255,0.85) 0%,transparent 100%),radial-gradient(1px 1px at 15% 38%,rgba(255,255,255,0.6) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 55% 45%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 78% 35%,rgba(200,200,255,0.8) 0%,transparent 100%),radial-gradient(1px 1px at 33% 58%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 91% 52%,rgba(255,255,255,0.9) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 5% 70%,rgba(200,210,255,0.6) 0%,transparent 100%),radial-gradient(1px 1px at 48% 75%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 70% 68%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 20% 88%,rgba(255,255,255,0.6) 0%,transparent 100%),radial-gradient(1px 1px at 60% 90%,rgba(200,200,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 38% 82%,rgba(255,255,255,0.4) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 95% 78%,rgba(255,255,255,0.8) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 12% 55%,rgba(255,255,255,0.5) 0%,transparent 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute -right-[60px] -top-[80px] h-[400px] w-[500px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at 40% 40%, rgba(88,28,135,0.35) 0%, rgba(67,20,120,0.15) 40%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-60px] left-[20%] h-75 w-87.5 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(30,58,138,0.2) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute right-[8%] top-[30%] h-[250px] w-[280px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(157,23,77,0.12) 0%, transparent 70%)' }}
      />

      <div className="pointer-events-none absolute inset-0 z-[1]">
        {shouldRenderScene && webGLReady && !reducedMotion ? (
          <Suspense fallback={<div className="h-full w-full bg-[#03010a]" />}>
            <HeroScene mouse={mouse} />
          </Suspense>
        ) : (
          <div className="mobile-gradient-animated h-full w-full" style={isMobile ? mobileStyle : undefined} />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ background: 'linear-gradient(90deg, rgba(3,1,10,0.75) 0%, rgba(3,1,10,0.55) 45%, rgba(3,1,10,0.20) 75%, transparent 100%)' }}
      />

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="w-full px-[max(20px,5vw)] pb-[60px] pt-[100px] md:pl-[max(24px,5vw)] md:pr-8 md:pt-[120px] lg:max-w-[55%] lg:pr-0">
          <div className="mb-[10px] font-mono text-[9px] tracking-[0.20em] text-[#64748b] md:text-[10px] md:tracking-[0.22em]">
            Available for freelance work • Quick response • Open to projects
          </div>

          <div className="mb-[18px] h-px w-[40px] bg-[rgba(124,58,237,0.5)] md:mb-[22px] md:w-[50px]" />

          <h1 className="text-[clamp(32px,8vw,68px)] font-[900] leading-[1.1] tracking-[-0.02em] text-[#f1f5f9] md:text-[clamp(38px,4.5vw,68px)] md:leading-[1.05]">
            I Build Web Apps That{' '}
            <span
              style={{
                background: 'linear-gradient(110deg, #a78bfa 0%, #ec4899 55%, #fb923c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 4s ease infinite',
                display: 'block',
                fontFamily: 'inherit',
                fontWeight: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                letterSpacing: 'inherit',
              }}
            >
              Help Businesses Grow
            </span>
          </h1>

          <p className="mb-[28px] mt-[18px] max-w-[90vw] text-[15px] leading-[1.65] text-[#94a3b8] md:mb-[32px] md:mt-[22px] md:max-w-95 md:text-[17px] md:leading-[1.7]">
            Full stack developer helping startups and businesses build fast, scalable, and reliable web applications.
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute right-6 top-20 z-20 hidden flex-col items-end gap-1 lg:flex">
        <div className="glass-surface flex flex-col gap-1.5 rounded-xl px-4 py-3">
          <div className="mb-1.5 grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} className="h-[3px] w-[3px] rounded-full bg-[rgba(124,58,237,0.5)]" />
            ))}
          </div>
          <div className="font-mono text-[9px] text-emerald-400">
            SYS:ONLINE<span style={{ animation: 'blink 1.5s infinite' }}>_</span>
          </div>
          <div className="font-mono text-[9px] text-[#475569]">LOC:EARTH_IN</div>
          <div className="font-mono text-[9px] text-[#475569]">LAT:26.4499°N</div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 md:gap-4">
        <motion.div
          className="flex flex-col items-center gap-[12px] md:gap-[14px]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.55 }}
        >
          <button
            onClick={onViewProjects}
            data-cursor-label="VIEW"
            className="group flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,237,0.04)] px-8 py-[14px] text-[16px] text-[#f1f5f9] backdrop-blur-[8px] transition-all duration-300 hover:border-[rgba(124,58,237,0.6)] hover:bg-[rgba(124,58,237,0.08)] md:px-10 md:py-[18px] md:text-[18px]"
          >
            View My Work
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </motion.div>
        <div className="h-8 w-px bg-gradient-to-b from-transparent via-[rgba(124,58,237,0.5)] to-transparent md:h-10" />
        <div className="relative h-5 w-[10px] overflow-hidden rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.08)] px-[4px] py-1 md:h-6 md:w-[11px] md:px-[5px]">
          <div className="absolute left-1/2 top-1 h-1 w-[2px] -translate-x-1/2 rounded-full bg-[rgba(124,58,237,0.9)] md:h-1.5 md:w-[3px]" style={{ animation: 'scrollbounce 1.4s ease-in-out infinite' }} />
        </div>
        <span className="font-mono text-[7px] tracking-[0.22em] text-[#334155] md:text-[8px] md:tracking-[0.25em]">SCROLL</span>
      </div>

    </div>
  )
}

export default memo(Hero)
