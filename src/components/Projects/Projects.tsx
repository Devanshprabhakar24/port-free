import { lazy, Suspense } from 'react'
import { useDetectWebGL } from '../../hooks/useDetectWebGL'
import type { MousePosition } from '../../hooks/useMousePosition'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'

const Carousel3D = lazy(() => import('./Carousel3D'))

export default function Projects({ mouse }: { mouse: MousePosition }) {
  void mouse
  const hasWebGL = useDetectWebGL()

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 pb-14 pt-16 md:pt-12">
      <div className="relative mb-12 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(124,58,237,0.12)] blur-[60px]" />

        <p className="relative mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7c3aed]">Recent Work</p>
        <h2 className="relative font-display text-[clamp(32px,4.2vw,58px)] font-black leading-[1.2] tracking-[-0.03em] text-white">
          Real Projects.{' '}
          <span className="text-gradient">Real Results.</span>
        </h2>
        <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[rgba(124,58,237,0.5)] to-transparent" />
        <p className="mx-auto mt-5 max-w-md text-[14px] leading-[1.8] text-[#64748b]">
          Here are some systems I've built for real-world use cases.
        </p>
      </div>

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
    </div>
  )
}
