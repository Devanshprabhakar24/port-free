import { useEffect, useState } from 'react'

export function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    const onChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reducedMotion
}
