import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { MousePosition } from '../../hooks/useMousePosition'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { CONTACT_API_URL } from '../../config/api'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: ''
  })

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

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    // Form validation
    if (!formData.name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }
    if (!formData.projectType) {
      setError('Please select a project type')
      setLoading(false)
      return
    }
    if (!formData.message.trim()) {
      setError('Message is required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        // Show specific validation errors if available
        const errorMessage = data.errors 
          ? data.errors.join(', ') 
          : data.message || 'Failed to send message'
        throw new Error(errorMessage)
      }

      runBurst()
      setSubmitted(true)
      setFormData({ name: '', email: '', projectType: '', budget: '', message: '' })
    } catch (err) {
      console.error('Contact form error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }, [formData, runBurst])

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
          className="pointer-events-none absolute left-[-18vw] top-[8%] z-5 h-0.5 w-[18vw]"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: '132vw', y: '22vh', opacity: [0, 0.7, 0] }}
          transition={{ duration: 1.35, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <div className="h-full w-full bg-linear-to-r from-transparent via-cyan-100/80 to-transparent blur-[0.3px]" />
          <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyan-100/85 blur-[1.6px]" />
        </motion.div>
      ) : null}

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="premium-surface rounded-3xl p-8 md:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/35 bg-violet-500/10 px-4 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-200">Start a Project</span>
              </div>

              <div>
                <h2 className="bg-gradient-to-r from-white via-violet-100 to-pink-100 bg-clip-text text-[clamp(26px,2.8vw,44px)] font-bold leading-[1.3] tracking-[-0.02em] text-transparent md:text-[clamp(30px,3.2vw,48px)]">
                  Ready To Build?
                </h2>
                <p className="mt-5 max-w-xl text-[16px] leading-[1.8] text-slate-300 md:text-[17px]">
                  No spam. Honest talk about turning your business idea into revenue-generating software that works.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:max-w-md">
                <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-sm transition-all duration-300 hover:border-violet-400/30 hover:bg-white/[0.08]">
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-violet-400">Response Time</div>
                  <div className="font-display text-3xl font-bold text-white">24h</div>
                  <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" />
                </div>
                <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/30 hover:bg-white/[0.08]">
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400">Status</div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="font-display text-xl font-semibold text-white">Available</span>
                  </div>
                  <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">Quick Contact</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:dev24prabhakar@gmail.com"
                    className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-violet-400/50 hover:bg-violet-500/10 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                  >
                    <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    dev24prabhakar@gmail.com
                  </a>
                  <a
                    href="tel:+918009968319"
                    className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  >
                    <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +91 8009968319
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <p className="w-full text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">Connect</p>
                {[
                  { label: 'GitHub', href: 'https://github.com/Devanshprabhakar24' },
                  { label: 'LinkedIn', href: 'https://linkedin.com/in/devansh24prabhakar' },
                  { label: 'LeetCode', href: 'https://leetcode.com' },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-pink-400/50 hover:bg-pink-500/10 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                  >
                    {social.label}
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 hidden lg:block" aria-hidden="true">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-90 w-90 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/25"
                  animate={reducedMotion ? undefined : { rotate: 360 }}
                  transition={reducedMotion ? undefined : { duration: 36, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                >
                  <div className="absolute left-1/2 -top-1.75 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-violet-300/75 blur-[0.5px]" />
                </motion.div>

                <motion.div
                  className="absolute left-1/2 top-1/2 h-72.5 w-72.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20"
                  animate={reducedMotion ? undefined : { rotate: -360 }}
                  transition={reducedMotion ? undefined : { duration: 28, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                >
                  <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cyan-200/70 blur-[0.5px]" />
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      Your Name
                    </label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-4 py-3.5 text-[15px] text-white placeholder-slate-500 backdrop-blur-sm transition-all duration-300 focus:border-violet-400/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      Email Address
                    </label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-4 py-3.5 text-[15px] text-white placeholder-slate-500 backdrop-blur-sm transition-all duration-300 focus:border-violet-400/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      Project Type
                    </label>
                    <select
                      className="w-full appearance-none rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-4 py-3 text-[15px] text-white backdrop-blur-sm transition-all duration-300 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      style={{ colorScheme: 'dark' }}
                      required
                    >
                      <option value="" className="bg-[#0f0f1e]">Select project type</option>
                      <option value="full-web-app" className="bg-[#0f0f1e]">Full Web Application (Frontend + Backend)</option>
                      <option value="saas-startup" className="bg-[#0f0f1e]">SaaS / Startup Product</option>
                      <option value="ecommerce" className="bg-[#0f0f1e]">E-commerce Website</option>
                      <option value="admin-dashboard" className="bg-[#0f0f1e]">Admin Dashboard / Internal Tool</option>
                      <option value="landing-business" className="bg-[#0f0f1e]">Landing Page / Business Website</option>
                      <option value="backend-api" className="bg-[#0f0f1e]">Backend Development / API</option>
                      <option value="bug-fixing" className="bg-[#0f0f1e]">Bug Fixing / Performance Optimization</option>
                      <option value="upgrade-app" className="bg-[#0f0f1e]">Upgrade or Improve Existing App</option>
                      <option value="need-guidance" className="bg-[#0f0f1e]">Not Sure / Need Guidance</option>
                    </select>
                    <p className="mt-2 text-sm text-white/60">
                      Not sure what you need? Select 'Need Guidance' — I’ll help you decide.
                    </p>
                  </div>
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      Budget Range
                    </label>
                    <select
                      className="w-full appearance-none rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-4 py-3.5 text-[15px] text-white backdrop-blur-sm transition-all duration-300 focus:border-violet-400/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" className="bg-[#0f0f1e]">Select range...</option>
                      <option value="5k-10k" className="bg-[#0f0f1e]">₹5,000 – ₹10,000</option>
                      <option value="10k-25k" className="bg-[#0f0f1e]">₹10,000 – ₹25,000</option>
                      <option value="25k-50k" className="bg-[#0f0f1e]">₹25,000 – ₹50,000</option>
                      <option value="50k+" className="bg-[#0f0f1e]">₹50,000+</option>
                      <option value="discuss" className="bg-[#0f0f1e]">Let's Discuss</option>
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    What business problem are you trying to solve?
                  </label>
                  <textarea
                    className="h-32 w-full resize-none rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-4 py-3.5 text-[15px] leading-[1.7] text-white placeholder-slate-500 backdrop-blur-sm transition-all duration-300 focus:border-violet-400/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                    placeholder="Describe your project idea, goals, and any important details. The more you share, the better I can help!"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-red-400"
                  >
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    {error}
                  </motion.p>
                )}

                {submitted ? (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-emerald-400"
                  >
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    MESSAGE SENT. I'LL REPLY WITHIN 24 HOURS
                    <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
                  </motion.p>
                ) : null}

                <div className="relative pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-xl border border-white/20 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 px-6 py-4 font-semibold text-white shadow-[0_8px_32px_rgba(124,58,237,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(124,58,237,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 text-[16px]">
                      {loading ? 'Sending...' : 'Start Your Project'}
                      {!loading && (
                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </button>
                  <div ref={particleWrapRef} className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span key={i} className="h-2 w-2 rounded-full bg-fuchsia-300 opacity-0" />
                    ))}
                  </div>
                </div>

                <p className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  No spam. Just real conversations.
                </p>

                <div className="pt-3">
                  <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                    <span className="h-px w-8 bg-gradient-to-r from-emerald-500 to-transparent" />
                    Signal Strength
                  </p>
                  <div className="flex items-end gap-2">
                    {[10, 14, 18, 22, 26].map((height, index) => (
                      <motion.span
                        key={height}
                        className="w-2 rounded-sm bg-gradient-to-t from-emerald-500 to-emerald-300"
                        style={{ height }}
                        animate={reducedMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
                        transition={
                          reducedMotion
                            ? undefined
                            : {
                                repeat: Number.POSITIVE_INFINITY,
                                duration: 1.2,
                                delay: index * 0.1,
                                ease: 'easeInOut',
                              }
                        }
                      />
                    ))}
                    <span className="ml-2 font-mono text-[11px] font-medium text-emerald-400">STRONG</span>
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
