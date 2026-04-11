import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { MousePosition } from '../../hooks/useMousePosition'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import TerrainBackground from './TerrainBackground'

const CONSTELLATION_POINTS = [
  { id: 'a', x: 12, y: 22, size: 6 },
  { id: 'b', x: 26, y: 34, size: 4 },
  { id: 'c', x: 41, y: 20, size: 5 },
  { id: 'd', x: 57, y: 36, size: 4 },
  { id: 'e', x: 71, y: 24, size: 5 },
  { id: 'f', x: 84, y: 40, size: 4 },
]

const CONSTELLATION_LINKS = [
  ['a', 'b'],
  ['b', 'c'],
  ['c', 'd'],
  ['d', 'e'],
  ['e', 'f'],
  ['b', 'd'],
] as const

export default function Contact({ mouse, shouldRenderScene = true }: { mouse: MousePosition; shouldRenderScene?: boolean }) {
  void mouse
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const particleWrapRef = useRef<HTMLDivElement>(null)
  const [starSweepTick, setStarSweepTick] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const runBurst = useCallback(() => {
    const root = particleWrapRef.current
    if (!root) {
      return
    }

    const particles = Array.from(root.children) as HTMLSpanElement[]

    if (reducedMotion) {
      particles.forEach((particle) => {
        particle.style.opacity = '0'
      })
      return
    }

    particles.forEach((particle, index) => {
      gsap.fromTo(
        particle,
        { opacity: 1, x: 0, y: 0, scale: 1 },
        {
          opacity: 0,
          x: (index - particles.length / 2) * 10,
          y: -Math.random() * 80 - 20,
          scale: 0,
          duration: 0.65,
          ease: 'power3.out',
        },
      )
    })
  }, [reducedMotion])

  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    runBurst()
    setSubmitted(true)
  }, [runBurst])

  const socialLinks = [
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
  ]

  useEffect(() => {
    if (reducedMotion) {
      return
    }

    let timeoutId: number | null = null

    const scheduleNext = () => {
      const delay = 8000 + Math.floor(Math.random() * 4000)
      timeoutId = window.setTimeout(() => {
        setStarSweepTick((prev) => prev + 1)
        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [reducedMotion])

  return (
    <div className="relative min-h-screen overflow-hidden px-6 pb-20 pt-24 md:pt-20 lg:pt-22">
      <div className="absolute inset-0">
        {isMobile || !shouldRenderScene ? (
          <div className="mobile-gradient-animated h-full w-full" />
        ) : (
          <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }} dpr={[1, isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2)]}>
            <ambientLight intensity={0.75} />
            <pointLight position={[2, 3, 2]} intensity={1.1} color="#ec4899" />
            <TerrainBackground />
          </Canvas>
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(40vw 30vh at 18% 22%, rgba(56,189,248,0.14), transparent 72%), radial-gradient(44vw 34vh at 82% 18%, rgba(168,85,247,0.16), transparent 72%), radial-gradient(48vw 38vh at 52% 86%, rgba(236,72,153,0.1), transparent 75%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: 'radial-gradient(rgba(226,232,240,0.55) 0.9px, transparent 0.9px)',
          backgroundSize: '3px 3px',
        }}
      />

      {!reducedMotion ? (
        <motion.div
          key={starSweepTick}
          className="pointer-events-none absolute left-[-18vw] top-[8%] z-[5] h-[2px] w-[18vw]"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: '132vw', y: '22vh', opacity: [0, 0.7, 0] }}
          transition={{ duration: 1.35, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-cyan-100/80 to-transparent blur-[0.3px]" />
          <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyan-100/85 blur-[1.6px]" />
        </motion.div>
      ) : null}

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="premium-surface rounded-3xl p-8 md:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div className="space-y-7">
              <div className="inline-flex rounded-full border border-violet-300/35 bg-violet-500/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-violet-200">
                Contact Mission Control
              </div>

              <div>
                <h2 className="font-mono text-2xl uppercase tracking-[0.15em] text-white md:text-3xl">
                  Initiate Transmission
                </h2>
                <p className="mt-4 max-w-xl text-[1.02rem] italic leading-relaxed text-slate-400">
                  Send a signal. I respond within 24 Earth hours.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Response</div>
                  <div className="mt-1 font-display text-2xl text-white">24h</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Current Focus</div>
                  <div className="mt-1 font-display text-2xl text-white">Web + 3D</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ rotateX: 10, rotateY: -12, scale: 1.05 }}
                    className="btn-glass px-5 py-2 text-sm text-white"
                  >
                    {social.label}
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 hidden lg:block" aria-hidden="true">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/25"
                  animate={reducedMotion ? undefined : { rotate: 360 }}
                  transition={reducedMotion ? undefined : { duration: 36, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                >
                  <div className="absolute left-1/2 top-[-7px] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-violet-300/75 blur-[0.5px]" />
                </motion.div>

                <motion.div
                  className="absolute left-1/2 top-1/2 h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20"
                  animate={reducedMotion ? undefined : { rotate: -360 }}
                  transition={reducedMotion ? undefined : { duration: 28, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                >
                  <div className="absolute left-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cyan-200/70 blur-[0.5px]" />
                </motion.div>

                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {CONSTELLATION_LINKS.map(([from, to]) => {
                    const p1 = CONSTELLATION_POINTS.find((point) => point.id === from)
                    const p2 = CONSTELLATION_POINTS.find((point) => point.id === to)

                    if (!p1 || !p2) {
                      return null
                    }

                    return (
                      <line
                        key={`${from}-${to}`}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke="rgba(148,163,184,0.34)"
                        strokeWidth="0.22"
                        strokeDasharray="1.2 1.1"
                      />
                    )
                  })}

                  {CONSTELLATION_POINTS.map((point) => (
                    <circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      r={point.size * 0.08}
                      fill="rgba(226,232,240,0.92)"
                    />
                  ))}
                </svg>
              </div>

              <form className="relative z-10 space-y-4" onSubmit={onSubmit}>
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#7c3aed]">NAME &gt;</label>
                  <input
                    className="mt-2 w-full border-0 border-b border-[#7c3aed] bg-transparent px-0 py-3 text-white outline-none placeholder:text-slate-500"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#7c3aed]">EMAIL &gt;</label>
                  <input
                    className="mt-2 w-full border-0 border-b border-[#7c3aed] bg-transparent px-0 py-3 text-white outline-none placeholder:text-slate-500"
                    type="email"
                    placeholder="Your email"
                    required
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#7c3aed]">MESSAGE &gt;</label>
                  <textarea
                    className="mt-2 h-32 w-full border-0 border-b border-[#7c3aed] bg-transparent px-0 py-3 text-white outline-none placeholder:text-slate-500"
                    placeholder="Project details"
                    required
                  />
                </div>

                {submitted ? (
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">
                    SIGNAL RECEIVED. AWAITING RESPONSE...
                    <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
                  </p>
                ) : null}

                <div className="relative pt-1">
                  <button
                    type="submit"
                    className="btn-primary group relative w-full overflow-hidden px-4 py-3.5 font-semibold text-white"
                  >
                    <span className="relative z-10">TRANSMIT →</span>
                    <span className="submit-shimmer absolute inset-0 -translate-x-[140%] bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] transition-transform duration-700 group-hover:translate-x-[140%]" />
                  </button>
                  <div ref={particleWrapRef} className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span key={i} className="h-2 w-2 rounded-full bg-fuchsia-300 opacity-0" />
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Signal Strength</p>
                  <div className="flex items-end gap-1.5">
                    {[8, 12, 16, 20, 24].map((height, index) => (
                      <motion.span
                        key={height}
                        className="w-1.5 rounded-sm bg-emerald-400"
                        style={{ height }}
                        animate={reducedMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
                        transition={
                          reducedMotion
                            ? undefined
                            : {
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 1,
                                delay: index * 0.08,
                                ease: 'easeInOut',
                              }
                        }
                      />
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
