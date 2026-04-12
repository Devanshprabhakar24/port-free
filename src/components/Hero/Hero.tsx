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
  onHireMe: () => void
  shouldRenderScene?: boolean
}

function Hero({ mouse, onViewProjects, onHireMe, shouldRenderScene = true }: HeroProps) {
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
          !isMobile ? (
            <Suspense fallback={<div className="h-full w-full bg-[#03010a]" />}>
              <HeroScene mouse={mouse} />
            </Suspense>
          ) : (
            <div className="mobile-gradient-animated h-full w-full" style={mobileStyle} />
          )
        ) : (
          <div className="mobile-gradient-animated h-full w-full" style={isMobile ? mobileStyle : undefined} />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ background: 'linear-gradient(90deg, rgba(3,1,10,0.92) 0%, rgba(3,1,10,0.72) 40%, rgba(3,1,10,0.4) 72%, rgba(3,1,10,0.18) 100%)' }}
      />

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="w-full pl-6 pr-6 pb-[60px] pt-[120px] md:pl-12 md:pr-8 lg:max-w-[55%] lg:pl-16 lg:pr-0">
        <div className="mb-[10px] font-mono text-[10px] tracking-[0.22em] text-[#64748b]">
          AVAILABLE FOR HIRE · INDIA · 2026_
        </div>

        <div className="mb-[22px] h-px w-[50px] bg-[rgba(124,58,237,0.5)]" />

        <h1 className="text-[clamp(38px,4.5vw,68px)] font-[900] leading-[1] tracking-[-0.02em] text-[#f1f5f9]">
          <span>Interfaces That</span>
        </h1>

        <h1
          className="text-[clamp(38px,4.5vw,68px)] font-[900] leading-[1.05] tracking-[-0.02em]"
          style={{
            background: 'linear-gradient(110deg, #a78bfa 0%, #ec4899 55%, #fb923c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}
        >
          Close Deals.
        </h1>

        <p className="mb-[32px] mt-[22px] max-w-95 text-[14px] leading-[1.7] text-[#94a3b8]">
          I build the digital products that turn first-time visitors into paying customers — fast, premium, and built to last.
        </p>

        <motion.div
          className="mb-[28px] flex flex-wrap items-center gap-[14px]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.55 }}
        >
          <button
            onClick={onViewProjects}
            data-cursor-label="VIEW"
            className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-[24px] py-[12px] text-[13px] text-[#f1f5f9] backdrop-blur-[8px] transition duration-300 hover:border-[rgba(124,58,237,0.6)] hover:bg-[rgba(124,58,237,0.08)]"
          >
            See My Work →
          </button>

          <button
            onClick={onHireMe}
            data-cursor-label="HIRE"
            className="rounded-full bg-linear-to-r from-[#7c3aed] to-[#ec4899] px-[28px] py-[12px] text-[13px] font-medium text-white shadow-[0_0_28px_rgba(124,58,237,0.45)] transition duration-300 hover:scale-[1.03] hover:shadow-[0_0_48px_rgba(124,58,237,0.7)]"
          >
            Start a Project
          </button>
        </motion.div>

        <div className="flex flex-wrap items-center gap-[18px]">
          <div className="flex items-center gap-[6px]">
            <span
              className="h-[7px] w-[7px] rounded-full bg-emerald-400"
              style={{ boxShadow: '0 0 8px rgba(34,197,94,0.9)', animation: 'pulse 2s ease-in-out infinite' }}
            />
            <span className="font-mono text-[10px] text-emerald-400 tracking-[0.16em]">OPEN TO PROJECTS</span>
          </div>
          <span className="font-mono text-[10px] text-[rgba(71,85,105,0.5)]">·</span>
          <span className="font-mono text-[10px] text-[#475569]">30+ products shipped</span>
          <span className="font-mono text-[10px] text-[rgba(71,85,105,0.5)]">·</span>
          <span className="font-mono text-[10px] text-[#475569]">4 yrs experience</span>
        </div>
      </div>
      </div>

      <div className="pointer-events-none absolute right-[48px] top-[88px] z-20 hidden flex-col items-end gap-[4px] lg:flex">
        <div className="mb-[6px] grid grid-cols-3 gap-[4px]">
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={index}
              className="h-[4px] w-[4px] rounded-full bg-[rgba(124,58,237,0.4)]"
            />
          ))}
        </div>
        <div className="font-mono text-[9px] tracking-[0.08em] text-[#22c55e]">
          SYS:ONLINE<span style={{ animation: 'blink 1.5s infinite' }}>_</span>
        </div>
        <div className="font-mono text-[9px] tracking-[0.08em] text-[#475569]">LOC:EARTH_IN</div>
        <div className="font-mono text-[9px] tracking-[0.08em] text-[#475569]">LAT:26.4499°N</div>
      </div>

      <div className="pointer-events-none absolute bottom-[28px] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-[6px]">
        <div className="h-[40px] w-px bg-[rgba(255,255,255,0.15)]" />
        <div
          className="h-1.25 w-1.25 rounded-full bg-[rgba(124,58,237,0.8)]"
          style={{ animation: 'scrollbounce 1.2s ease-in-out infinite' }}
        />
        <div className="font-mono text-[9px] tracking-[0.2em] text-[#475569]">SCROLL</div>
      </div>

    </div>
  )
}

export default memo(Hero)
