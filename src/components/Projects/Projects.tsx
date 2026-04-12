import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useDetectWebGL } from '../../hooks/useDetectWebGL'
import type { MousePosition } from '../../hooks/useMousePosition'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'

const Carousel3D = lazy(() => import('./Carousel3D'))

const mobileCards = [
  {
    title: 'Luxe Commerce',
    stack: ['React', 'Stripe', 'Node'],
    impact: 'E-commerce platform — 3× faster checkout, live in 6 weeks',
  },
  {
    title: 'Realtime Ops',
    stack: ['TypeScript', 'Redis', 'WebSockets'],
    impact: 'Operations dashboard handling 10K+ live events/sec',
  },
  {
    title: 'SaaS Command',
    stack: ['Next.js', 'Prisma', 'PostgreSQL'],
    impact: 'Full SaaS with auth, billing & role management',
  },
  {
    title: 'Insight Studio',
    stack: ['Three.js', 'GSAP', 'API'],
    impact: 'Interactive data visualization tool for analytics team',
  },
]

export default function Projects({ mouse }: { mouse: MousePosition }) {
  void mouse
  const isMobile = useIsMobile()
  const hasWebGL = useDetectWebGL()
  const [activeMobileIndex, setActiveMobileIndex] = useState(0)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  const onTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartY(event.touches[0].clientY)
  }, [])

  const onTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (touchStartY === null) {
        return
      }

      const delta = event.changedTouches[0].clientY - touchStartY
      if (Math.abs(delta) < 24) {
        return
      }

      if (delta < 0) {
        setActiveMobileIndex((current) => Math.min(current + 1, mobileCards.length - 1))
      } else {
        setActiveMobileIndex((current) => Math.max(current - 1, 0))
      }

      setTouchStartY(null)
    },
    [touchStartY],
  )

  const stackTransforms = useMemo(
    () =>
      mobileCards.map((_, index) => {
        const offset = index - activeMobileIndex
        return {
          transform: `translateY(${offset * 88}px) scale(${offset === 0 ? 1 : 0.93})`,
          opacity: offset === 0 ? 1 : 0.45,
          zIndex: mobileCards.length - Math.abs(offset),
        }
      }),
    [activeMobileIndex],
  )

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 pb-14 pt-16 md:pt-12">
      <div className="mb-10 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fuchsia-300">Selected Work</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-6xl">Projects That Shipped</h2>
        <p className="mx-auto mt-4 max-w-120 text-[14px] leading-[1.7] text-[#64748b]">
          Real products built for real clients. Each one shipped on time,
          within budget, and still running in production.
        </p>
      </div>

      {isMobile ? (
        <div
          className="relative h-130 overflow-hidden rounded-3xl border border-[rgba(124,58,237,0.2)] bg-white/3"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {mobileCards.map((card, index) => (
            <article
              key={card.title}
              className="absolute left-4 right-4 top-8 rounded-2xl border border-[rgba(124,58,237,0.2)] bg-[#0f1020]/70 p-5 will-change-transform transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]"
              style={stackTransforms[index]}
            >
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-violet-400">MISSION {String(index + 1).padStart(2, '0')}</p>
              <h3 className="font-display text-2xl text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-(--text-muted)">{card.stack.map((tech) => `◆ ${tech}`).join(' · ')}</p>
              <p className="mt-3 text-[11px] leading-[1.5] text-[#64748b] border-t border-[rgba(124,58,237,0.1)] pt-2">
                {card.impact}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="relative z-[10] premium-surface h-130 overflow-hidden rounded-3xl">
          {hasWebGL ? (
            <ErrorBoundary fallback={
              <div className="flex h-full items-center justify-center">
                <div className="h-[400px] w-full rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/20" />
              </div>
            }>
              <Suspense fallback={<div className="grid h-full place-items-center text-(--text-muted)">Loading carousel...</div>}>
                <Carousel3D />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-[400px] w-full rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/20" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
