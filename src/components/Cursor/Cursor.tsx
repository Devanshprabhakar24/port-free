import { memo, useEffect, useRef } from 'react'
import type { MousePosition } from '../../hooks/useMousePosition'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

type CursorProps = {
  mouse: MousePosition
}

const TRAIL_COUNT = 10

function Cursor({ mouse }: CursorProps) {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const trailDotsRef = useRef<(HTMLSpanElement | null)[]>([])

  const ringX = useRef(mouse.pixelX)
  const ringY = useRef(mouse.pixelY)
  const trailIdx = useRef(0)
  const trailAlphas = useRef<number[]>(new Array(TRAIL_COUNT).fill(0))
  const lastTrailPush = useRef(0)

  useEffect(() => {
    if (reducedMotion || isMobile) return

    let rafId = 0

    const animate = (time: number) => {
      const dot = dotRef.current
      const ring = ringRef.current
      const label = labelRef.current

      if (dot) {
        dot.style.transform = `translate3d(${mouse.pixelX - 4}px, ${mouse.pixelY - 4}px, 0)`
      }

      ringX.current += (mouse.pixelX - ringX.current) * 0.1
      ringY.current += (mouse.pixelY - ringY.current) * 0.1

      const speed = Math.min(mouse.speed, 40)
      const stretchX = 1 + speed * 0.012
      const stretchY = 1 - speed * 0.007
      const rotation = Math.atan2(mouse.velocityY, mouse.velocityX) * (180 / Math.PI)

      const size = mouse.target.isInteractive ? 80 : 40
      const fill = mouse.target.isInteractive ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.02)'
      const border = mouse.target.isOverCanvas ? 'rgba(255,255,255,0.7)' : 'rgba(241,245,249,0.55)'

      if (ring) {
        ring.style.width = `${size}px`
        ring.style.height = `${size}px`
        ring.style.background = fill
        ring.style.borderColor = border
        ring.style.transform = `translate3d(${ringX.current - size / 2}px, ${ringY.current - size / 2}px, 0) rotate(${rotation}deg) scale(${stretchX}, ${stretchY})`
      }

      if (label) {
        label.textContent = mouse.target.label
        label.style.opacity = mouse.target.isInteractive ? '1' : '0'
      }

      // Trail: use pre-allocated pool, no DOM churn
      if (mouse.target.isOverCanvas && time - lastTrailPush.current > 40) {
        const idx = trailIdx.current % TRAIL_COUNT
        const el = trailDotsRef.current[idx]
        if (el) {
          el.style.transform = `translate3d(${mouse.pixelX - 3}px, ${mouse.pixelY - 3}px, 0)`
          trailAlphas.current[idx] = 0.6
        }
        trailIdx.current++
        lastTrailPush.current = time
      }

      // Fade all trail dots
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const el = trailDotsRef.current[i]
        if (!el) continue
        trailAlphas.current[i] = Math.max(0, trailAlphas.current[i] - 0.03)
        el.style.opacity = String(trailAlphas.current[i])
      }

      rafId = window.requestAnimationFrame(animate)
    }

    rafId = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(rafId)
  }, [isMobile, mouse, reducedMotion])

  if (isMobile || reducedMotion) {
    return null
  }

  return (
    <div aria-hidden="true" className="custom-cursor-root pointer-events-none fixed inset-0 z-120">
      {/* Pre-allocated trail dots — no innerHTML, no DOM reflow */}
      <div className="pointer-events-none fixed inset-0">
        {Array.from({ length: TRAIL_COUNT }, (_, i) => (
          <span
            key={i}
            ref={(el) => { trailDotsRef.current[i] = el }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: 6,
              height: 6,
              borderRadius: 9999,
              background: 'rgba(241,245,249,1)',
              opacity: 0,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
      <div
        ref={dotRef}
        className="fixed h-2 w-2 rounded-full bg-white"
        style={{ left: 0, top: 0, willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="fixed rounded-full border"
        style={{
          left: 0,
          top: 0,
          width: 40,
          height: 40,
          borderColor: 'rgba(241,245,249,0.55)',
          willChange: 'transform',
          transformOrigin: 'center center',
        }}
      >
        <span
          ref={labelRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-[0.2em] text-slate-100"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  )
}

export default memo(Cursor)
