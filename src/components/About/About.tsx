import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { MousePosition } from '../../hooks/useMousePosition'
import SkillsScene from './SkillsScene'
import { useIsVisible } from '../../hooks/useIsVisible'

gsap.registerPlugin(ScrollTrigger)

type StatItem = {
  coordinate: string
  target: number
  suffix: string
  shortLabel: string
  label: string
}

const STATS: StatItem[] = [
  { coordinate: '[03] YEARS', target: 3, suffix: '+', shortLabel: 'YEARS', label: 'Years Experience' },
  { coordinate: '[05] PROJ', target: 5, suffix: '+', shortLabel: 'PROJ', label: 'Real Projects' },
  { coordinate: '[100] PROD', target: 100, suffix: '%', shortLabel: 'PROD', label: 'Production Ready' },
  { coordinate: '[24] HOURS', target: 24, suffix: 'h', shortLabel: 'HOURS', label: 'Fast Response' },
]

function About({ mouse: _mouse, shouldRenderScene = true }: { mouse: MousePosition; shouldRenderScene?: boolean }) {
  void _mouse
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const { ref: visRef, isVisible: sceneVisible } = useIsVisible('400px')
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const countTweensRef = useRef<gsap.core.Tween[]>([])
  const scrambleIntervalsRef = useRef<Array<number | null>>(Array(STATS.length).fill(null))
  const [counterValues, setCounterValues] = useState<number[]>(Array(STATS.length).fill(0))

  useEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    if (reducedMotion) {
      setCounterValues(STATS.map((item) => item.target))
      return
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          STATS.forEach((item, index) => {
            const valueState = { value: 0 }
            const tween = gsap.to(valueState, {
              value: item.target,
              duration: 1.25,
              ease: 'power3.out',
              onUpdate: () => {
                setCounterValues((prev) => {
                  const next = [...prev]
                  next[index] = Math.round(valueState.value)
                  return next
                })
              },
            })
            countTweensRef.current.push(tween)
          })
        },
      })
    }, section)

    return () => {
      countTweensRef.current.forEach((tween) => tween.kill())
      countTweensRef.current = []

      scrambleIntervalsRef.current.forEach((intervalId, idx) => {
        if (intervalId !== null) {
          window.clearInterval(intervalId)
          scrambleIntervalsRef.current[idx] = null
        }
      })

      ctx.revert()
    }
  }, [reducedMotion])

  const onStatHover = (index: number) => {
    if (scrambleIntervalsRef.current[index] !== null) {
      window.clearInterval(scrambleIntervalsRef.current[index] as number)
      scrambleIntervalsRef.current[index] = null
    }

    const target = STATS[index].target
    const started = performance.now()
    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - started

      if (elapsed >= 300) {
        window.clearInterval(intervalId)
        scrambleIntervalsRef.current[index] = null
        setCounterValues((prev) => {
          const next = [...prev]
          next[index] = target
          return next
        })
        return
      }

      const randomValue = Math.floor(Math.random() * 100)
      setCounterValues((prev) => {
        const next = [...prev]
        next[index] = randomValue
        return next
      })
    }, 1000 / 60)

    scrambleIntervalsRef.current[index] = intervalId
  }

  const starsPattern = useMemo(
    () =>
      'radial-gradient(1px 1px at 8% 12%,rgba(255,255,255,0.95) 0%,transparent 100%),radial-gradient(1px 1px at 25% 5%,rgba(255,255,255,0.8) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 42% 22%,rgba(255,255,255,0.9) 0%,transparent 100%),radial-gradient(1px 1px at 67% 8%,rgba(200,210,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 85% 18%,rgba(255,255,255,0.85) 0%,transparent 100%),radial-gradient(1px 1px at 15% 38%,rgba(255,255,255,0.6) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 55% 45%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 78% 35%,rgba(200,200,255,0.8) 0%,transparent 100%),radial-gradient(1px 1px at 33% 58%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 91% 52%,rgba(255,255,255,0.9) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 5% 70%,rgba(200,210,255,0.6) 0%,transparent 100%),radial-gradient(1px 1px at 48% 75%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 70% 68%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 20% 88%,rgba(255,255,255,0.6) 0%,transparent 100%),radial-gradient(1px 1px at 60% 90%,rgba(200,200,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 38% 82%,rgba(255,255,255,0.4) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 95% 78%,rgba(255,255,255,0.8) 0%,transparent 100%),radial-gradient(0.5px 0.5px at 12% 55%,rgba(255,255,255,0.5) 0%,transparent 100%)',
    [],
  )

  return (
    <div
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#000000]"
    >
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: starsPattern }} />

      <div
        className="pointer-events-none absolute -left-10 -top-15 h-75 w-100 rounded-full"
        style={{ background: 'radial-gradient(ellipse at 40% 40%, rgba(88,28,135,0.2) 0%, transparent 70%)' }}
      />

      <div
        className="pointer-events-none absolute -bottom-10 right-[30%] h-70 w-87.5 rounded-full"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(30,58,138,0.15) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 grid min-h-screen grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center px-6 py-16 lg:pl-12 lg:pr-0">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-5 bg-[rgba(124,58,237,0.6)]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7c3aed]">WHY CLIENTS WORK WITH ME</p>
          </div>

          <h2
            className="mb-6 text-[clamp(28px,3.2vw,48px)] font-bold leading-[1.2]"
            style={{
              background: 'linear-gradient(110deg, #a78bfa 0%, #ec4899 60%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            I don’t just write code —
            <br />
            I partner to hit your business goals.
          </h2>

          <p className="mb-10 max-w-lg border-l-2 border-[rgba(124,58,237,0.4)] pl-5 text-[16px] leading-[1.9] text-[#94a3b8]">
            I build scalable web apps that handle real users and grow with your business. Stop worrying about crashes or slow load times. Ensure your platform handles heavy traffic and processes data efficiently.
          </p>

          <div className="mb-8 space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-[rgba(124,58,237,0.5)] flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
              </span>
              <div>
                <span className="font-semibold text-white">Custom SaaS & Web Platforms</span>
                <p className="text-[14px] leading-[1.6] text-[#94a3b8]">Turn your idea into a launched product without sacrificing security or scalability.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-[rgba(124,58,237,0.5)] flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ce31b5]" />
              </span>
              <div>
                <span className="font-semibold text-white">Backend Systems & Custom APIs</span>
                <p className="text-[14px] leading-[1.6] text-[#94a3b8]">Robust server architectures built to last. When your business takes off, your app won't break.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-[rgba(124,58,237,0.5)] flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-[#fb923c]" />
              </span>
              <div>
                <span className="font-semibold text-white">Dashboards & Admin Panels</span>
                <p className="text-[14px] leading-[1.6] text-[#94a3b8]">Save hours of time with automated tools that give you a birds-eye view of your business.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <button
                key={stat.coordinate}
                onMouseEnter={() => onStatHover(index)}
                className="glass-surface group rounded-2xl p-4 text-left transition-all duration-300 hover:border-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.05)]"
              >
                <div className="mb-2 font-mono text-[8px] tracking-[0.12em] text-[#7c3aed]">{stat.coordinate}</div>
                <div className="tabular-nums text-[36px] font-black leading-none text-[#f1f5f9]">
                  {counterValues[index]}
                  {stat.suffix}
                </div>
                <div className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-[#475569]">{stat.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div ref={visRef} className="relative z-[5] min-h-[420px] overflow-hidden rounded-2xl border border-[rgba(124,58,237,0.1)] bg-transparent lg:min-h-105">
{isMobile || !shouldRenderScene || !sceneVisible ? <div className="mobile-gradient-animated h-full w-full bg-[#07070d]" /> : <SkillsScene />}
        </div>
      </div>
    </div>
  )
}

export default memo(About)
