import gsap from 'gsap'
import { memo, useEffect, useRef, useState } from 'react'

type LoaderProps = {
  onComplete?: () => void  // ⚡ Make optional for Suspense fallback usage
}

function Loader({ onComplete }: LoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const logoLettersRef = useRef<HTMLSpanElement[]>([])
  const [display, setDisplay] = useState('000')

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      onComplete?.()
      return
    }

    const counter = { value: 0 }

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete?.()
      },
    })

    tl.to(counter, {
      value: 100,
      duration: 2,
      ease: 'elastic.out(1, 0.7)',
      onUpdate: () => {
        const n = Math.round(counter.value)
        setDisplay(String(n).padStart(3, '0'))
      },
    }, 0)

    tl.fromTo(
      logoLettersRef.current,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
      },
      0.08,
    )

    tl.fromTo(
      barRef.current,
      { scaleX: 0 },
      { scaleX: 1, transformOrigin: 'left center', duration: 2, ease: 'power2.out' },
      0,
    )

    tl.to(rootRef.current, {
      yPercent: -100,
      duration: 0.9,
      ease: 'expo.inOut',
      delay: 0.15,
    })

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div ref={rootRef} className="fixed inset-0 z-140 grid place-items-center bg-[#07070d]">
      <div className="w-full max-w-5xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Loading Experience</div>
          <div className="font-display text-[40px] leading-none text-white" ref={countRef}>
            {display.split('').map((digit, index) => (
              <span key={`${digit}-${index}`} className="inline-block px-0.5">
                {digit}
              </span>
            ))}
            <span className="ml-1 text-slate-500">%</span>
          </div>
        </div>

        <div className="h-px w-full bg-white/20">
          <div ref={barRef} className="h-full w-full bg-linear-to-r from-violet-500 via-pink-500 to-amber-400" />
        </div>

        <div className="mt-14 overflow-hidden text-center">
          {'DP'.split('').map((char, index) => (
            <span
              key={char}
              ref={(el) => {
                if (el) {
                  logoLettersRef.current[index] = el
                }
              }}
              className="font-display inline-block text-6xl tracking-[0.08em] text-white"
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(Loader)
