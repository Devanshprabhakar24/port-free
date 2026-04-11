import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { MousePosition } from '../../hooks/useMousePosition'

const Carousel3D = lazy(() => import('./Carousel3D'))

const mobileCards = [
  { title: 'Luxe Commerce', stack: ['React', 'Stripe', 'Node'] },
  { title: 'Realtime Ops', stack: ['TypeScript', 'Redis', 'WebSockets'] },
  { title: 'SaaS Command', stack: ['Next.js', 'Prisma', 'PostgreSQL'] },
  { title: 'Insight Studio', stack: ['Three.js', 'GSAP', 'API'] },
]

export default function Projects({ mouse }: { mouse: MousePosition }) {
  const isMobile = useIsMobile()
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
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fuchsia-300">Mission Files</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-6xl">Selected Missions</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--text-muted)]">
          Interactive project cards with parallax depth, hover flip reveals, and drag-ready ring controls.
          Mouse vector: ({mouse.x.toFixed(2)}, {mouse.y.toFixed(2)})
        </p>
      </div>

      {isMobile ? (
        <div
          className="relative h-[520px] overflow-hidden rounded-3xl border border-[rgba(124,58,237,0.2)] bg-white/[0.03]"
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
              <p className="mt-2 text-sm text-[var(--text-muted)]">{card.stack.map((tech) => `◆ ${tech}`).join(' · ')}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="premium-surface h-[520px] overflow-hidden rounded-3xl">
          <Suspense fallback={<div className="grid h-full place-items-center text-[var(--text-muted)]">Loading carousel...</div>}>
            <Carousel3D />
          </Suspense>
        </div>
      )}
    </div>
  )
}
