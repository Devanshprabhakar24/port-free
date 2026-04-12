import { useEffect, useRef, useState } from 'react'

type CursorLabel = 'VIEW' | 'HIRE' | ''

type MouseTarget = {
  isInteractive: boolean
  isOverCanvas: boolean
  label: CursorLabel
}

export type MousePosition = {
  x: number
  y: number
  smoothX: number
  smoothY: number
  pixelX: number
  pixelY: number
  smoothPixelX: number
  smoothPixelY: number
  velocityX: number
  velocityY: number
  speed: number
  target: MouseTarget
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const initialState = (): MousePosition => {
  const centerX = typeof window !== 'undefined' ? window.innerWidth * 0.5 : 0
  const centerY = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 0

  return {
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0,
    pixelX: centerX,
    pixelY: centerY,
    smoothPixelX: centerX,
    smoothPixelY: centerY,
    velocityX: 0,
    velocityY: 0,
    speed: 0,
    target: {
      isInteractive: false,
      isOverCanvas: false,
      label: '',
    },
  }
}

const detectCursorLabel = (node: Element | null): CursorLabel => {
  if (!node) {
    return ''
  }

  const explicit = node.getAttribute('data-cursor-label')
  if (explicit === 'VIEW' || explicit === 'HIRE') {
    return explicit
  }

  const text = node.textContent?.toLowerCase().trim() ?? ''
  if (text.includes('hire')) {
    return 'HIRE'
  }
  if (text.includes('view') || text.includes('project') || text.includes('work')) {
    return 'VIEW'
  }

  return ''
}

export function useMousePosition() {
  const [mouse, setMouse] = useState<MousePosition>(initialState)
  const targetRef = useRef<MousePosition>(initialState())
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const nextX = event.clientX
      const nextY = event.clientY

      const normalizedX = clamp((nextX / window.innerWidth) * 2 - 1, -1, 1)
      const normalizedY = clamp(-((nextY / window.innerHeight) * 2 - 1), -1, 1)

      const previous = targetRef.current
      const vx = nextX - previous.pixelX
      const vy = nextY - previous.pixelY
      const speed = Math.hypot(vx, vy)

      const rawTarget = event.target instanceof Element ? event.target : null
      const interactiveNode = rawTarget?.closest(
        'a,button,[role="button"],input,textarea,select,[data-cursor-label]',
      )
      const canvasNode = rawTarget?.closest('canvas')

      targetRef.current = {
        ...previous,
        x: normalizedX,
        y: normalizedY,
        pixelX: nextX,
        pixelY: nextY,
        velocityX: vx,
        velocityY: vy,
        speed,
        target: {
          isInteractive: Boolean(interactiveNode),
          isOverCanvas: Boolean(canvasNode),
          label: detectCursorLabel(interactiveNode ?? null),
        },
      }
    }

    const onPointerLeave = () => {
      targetRef.current = {
        ...targetRef.current,
        velocityX: 0,
        velocityY: 0,
        speed: 0,
        target: {
          isInteractive: false,
          isOverCanvas: false,
          label: '',
        },
      }
    }

    // ⚡ OPTIMIZATION: Limit re-renders using ref batching
    let lastUpdateTime = 0
    const MIN_UPDATE_INTERVAL = 50 // ~20fps state updates (vs 60fps animation)

    const tick = () => {
      const current = targetRef.current
      const now = performance.now()

      const smoothPixelX = current.smoothPixelX + (current.pixelX - current.smoothPixelX) * 0.12
      const smoothPixelY = current.smoothPixelY + (current.pixelY - current.smoothPixelY) * 0.12
      const smoothX = current.smoothX + (current.x - current.smoothX) * 0.12
      const smoothY = current.smoothY + (current.y - current.smoothY) * 0.12

      const nextState: MousePosition = {
        ...current,
        smoothPixelX,
        smoothPixelY,
        smoothX,
        smoothY,
        velocityX: current.velocityX * 0.9,
        velocityY: current.velocityY * 0.9,
        speed: current.speed * 0.9,
      }

      targetRef.current = nextState

      // ⚡ Only update React state at intervals to batch updates
      if (now - lastUpdateTime >= MIN_UPDATE_INTERVAL) {
        setMouse(nextState)
        lastUpdateTime = now
      }

      rafRef.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(rafRef.current)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return mouse
}
