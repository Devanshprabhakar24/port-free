import { useEffect, useRef, useState } from 'react'

/**
 * Returns true when the element is in the viewport (with margin).
 * Used to lazy-mount expensive WebGL Canvas components.
 */
export function useIsVisible(margin = '200px') {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: margin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [margin])

  return { ref, isVisible }
}
