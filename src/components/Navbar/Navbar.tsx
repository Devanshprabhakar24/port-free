import gsap from 'gsap'
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { MousePosition } from '../../hooks/useMousePosition'
import { preloadRouteChunk } from '../../hooks/useRoutePreload'
import { useNavigationStore } from '../../store/navigationStore'

type RouteItem = {
  path: string
  label: string
}

const links: RouteItem[] = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/projects', label: 'Projects' },
  { path: '/contact', label: 'Contact' },
]

type NavbarProps = {
  mouse: MousePosition
}

function Navbar({ mouse }: NavbarProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const hireRef = useRef<HTMLButtonElement>(null)
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const location = useLocation()
  const navigate = useNavigate()
  const setPreviewPath = useNavigationStore((s) => s.setPreviewPath)

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
    setPreviewPath(null)
  }, [location.pathname, setPreviewPath])

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
    const item = splitLabels[index]
    if (item) {
      setPreviewPath(item.path)
      preloadRouteChunk(item.path)
    }

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
          className="flex w-full items-center justify-between px-[20px] py-[20px] transition-all duration-300 md:px-[40px]"
          style={{
            background: scrolled ? 'rgba(3,1,10,0.85)' : 'transparent',
            borderBottom: scrolled ? '1px solid transparent' : '1px solid transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
          }}
        >
          <NavLink
            to="/"
            className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-[rgba(255,255,255,0.9)]"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse" />
            DEVANSH PRABHAKAR
          </NavLink>

          <div className="hidden items-center gap-8 md:flex">
            {splitLabels.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                onMouseEnter={() => onLinkEnter(index)}
                onMouseLeave={() => setPreviewPath(null)}
                ref={(el) => {
                  linkRefs.current[index] = el
                }}
                className={`group relative overflow-hidden text-[13px] tracking-[0.02em] transition-colors duration-200 ${
                  location.pathname === item.path ? 'text-white' : 'text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
              >
                {item.chars.map((char, i) => (
                  <span key={`${item.path}-${i}`} className="inline-block">
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
                <span className="absolute left-0 top-[calc(100%+6px)] h-px w-full origin-left scale-x-0 bg-[#7c3aed] transition-transform duration-200 group-hover:scale-x-100" />
              </NavLink>
            ))}

            <button
              ref={hireRef}
              onMouseEnter={() => {
                setPreviewPath('/contact')
                preloadRouteChunk('/contact')
              }}
              onMouseLeave={() => setPreviewPath(null)}
              onClick={() => navigate('/contact')}
              data-cursor-label="HIRE"
              className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] px-[20px] py-[8px] text-[12px] font-medium tracking-[0.03em] text-white shadow-[0_0_24px_rgba(124,58,237,0.28)] transition duration-200 hover:scale-[1.02]"
            >
              Hire Me
            </button>
          </div>

          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="text-slate-100 md:hidden"
            aria-label="Open menu"
          >
            Menu
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
                  key={item.path}
                  initial={{ opacity: 0, y: 20, clipPath: 'inset(0 0 100% 0)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  onClick={() => {
                    setMobileOpen(false)
                    navigate(item.path)
                  }}
                  className="block text-left font-display text-3xl text-slate-100"
                >
                  {item.label}
                </motion.button>
              ))}
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
