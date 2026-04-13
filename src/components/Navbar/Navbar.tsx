import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { MousePosition } from '../../hooks/useMousePosition'
import type { SectionId } from '../../store/scrollSectionStore'

type RouteItem = {
  id: SectionId
  label: string
}

const links: RouteItem[] = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'Why Me' },
  { id: 'services', label: 'Services' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Hire Me' },
]

type NavbarProps = {
  mouse: MousePosition
  currentSection: SectionId
  onNavigate: (section: SectionId) => void
}

function Navbar({ mouse, currentSection, onNavigate }: NavbarProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const hireRef = useRef<HTMLButtonElement>(null)
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const node = rootRef.current
    if (!node) {
      return
    }

    if (reducedMotion) {
      gsap.set(node, { opacity: 1, y: 0 })
      return
    }

    gsap.to(node, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
    })
  }, [reducedMotion])

  useEffect(() => {
    setMobileOpen(false)
  }, [currentSection])

  // ⚡ OPTIMIZATION: Increase RAF throttle from 16ms to 50ms for button hover
  // This reduces CPU load by avoiding calculation on every mouse pixel change
  useEffect(() => {
    const btn = hireRef.current
    if (!btn || reducedMotion) {
      return
    }

    let rafId: number | null = null
    let lastUpdateTime = 0

    const updatePosition = () => {
      const now = performance.now()
      
      // ⚡ Only recalculate every 50ms instead of every frame
      if (now - lastUpdateTime < 50) {
        rafId = window.requestAnimationFrame(updatePosition)
        return
      }

      lastUpdateTime = now
      const rect = btn.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = mouse.pixelX - cx
      const dy = mouse.pixelY - cy
      const distance = Math.hypot(dx, dy)

      if (distance < 80) {
        gsap.to(btn, {
          x: dx * 0.18,
          y: dy * 0.18,
          duration: 0.3,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      } else {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }

      rafId = window.requestAnimationFrame(updatePosition)
    }

    rafId = window.requestAnimationFrame(updatePosition)

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [mouse.pixelX, mouse.pixelY, reducedMotion])

  const splitLabels = useMemo(
    () =>
      links.map((item) => ({
        ...item,
        chars: item.label.split(''),
      })),
    [],
  )

  const onLinkEnter = (index: number) => {
    if (reducedMotion) {
      return
    }

    const link = linkRefs.current[index]
    if (!link) {
      return
    }

    const chars = Array.from(link.querySelectorAll('span'))
    gsap.fromTo(
      chars,
      { y: 0 },
      {
        y: -8,
        duration: 0.32,
        stagger: 0.03,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      },
    )
  }

  return (
    <>
      <header
        ref={rootRef}
        className="fixed left-0 top-0 z-50 w-full opacity-0"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <nav
          className="flex w-full items-center justify-between px-4 py-4 transition-all duration-300 md:px-10 md:py-5"
          style={{
            background: scrolled ? 'rgba(3,1,10,0.85)' : 'transparent',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
          }}
        >
          <a
            href="#hero"
            onClick={(event) => {
              event.preventDefault()
              onNavigate('hero')
            }}
            className="group flex items-center gap-2 md:gap-3"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full md:h-9 md:w-9">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#ec4899]" />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-wider text-white md:text-[11px]">DP</span>
            </div>
            <span className="hidden text-[13px] tracking-[0.18em] text-white/90 transition-colors group-hover:text-white sm:inline">DEVANSH PRABHAKAR</span>
          </a>

          <div className="hidden items-center gap-10 md:flex">
            {splitLabels.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onMouseEnter={() => onLinkEnter(index)}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate(item.id)
                }}
                ref={(el) => {
                  linkRefs.current[index] = el
                }}
                className={`group relative overflow-hidden text-[15px] tracking-[0.02em] transition-colors duration-200 ${
                  currentSection === item.id ? 'text-white' : 'text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
              >
                {item.chars.map((char, i) => (
                  <span key={`${item.id}-${i}`} className="inline-block">
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
                <span className="absolute left-0 top-[calc(100%+6px)] h-px w-full origin-left scale-x-0 bg-[#7c3aed] transition-transform duration-200 group-hover:scale-x-100" />
                {currentSection === item.id ? (
                  <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#7c3aed] shadow-[0_0_6px_rgba(124,58,237,0.9)]" />
                ) : null}
              </a>
            ))}

            <button
              ref={hireRef}
              onClick={() => onNavigate('contact')}
              data-cursor-label="START"
              className="rounded-full bg-gradient-to-r from-[#7c3aed]/90 to-[#ec4899]/90 px-6 py-[10px] text-[14px] font-medium tracking-[0.03em] text-white shadow-[0_0_20px_rgba(124,58,237,0.25)] transition-all duration-200 hover:scale-[1.02] md:px-9 md:py-[15px] md:text-[18px] md:font-semibold md:shadow-[0_0_32px_rgba(124,58,237,0.32)] md:hover:scale-[1.05]"
            >
              Start Project →
            </button>
          </div>

          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[#7c3aed]/50 hover:bg-[#7c3aed]/10 md:hidden"
            aria-label="Open menu"
          >
            <span className={`h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-[#0a0a12]/95 p-8 backdrop-blur-2xl"
          >
            <div className="mt-16 space-y-6">
              {links.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20, clipPath: 'inset(0 0 100% 0)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  onClick={() => {
                    setMobileOpen(false)
                    onNavigate(item.id)
                  }}
                  className="block text-left font-display text-3xl text-slate-100"
                >
                  {item.label}
                </motion.button>
              ))}

              <div className="mt-10 border-t border-[rgba(255,255,255,0.06)] pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
                  <span className="font-mono text-[10px] tracking-[0.16em] text-emerald-400">AVAILABLE FOR PROJECTS</span>
                </div>
                <p className="text-[13px] text-[#475569] leading-[1.6]">
                  Open to freelance work and long-term collaborations.
                </p>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {scrolled ? (
        <div
          className="pointer-events-none fixed left-0 top-[68px] z-40 h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }}
        />
      ) : null}
    </>
  )
}

export default memo(Navbar)
