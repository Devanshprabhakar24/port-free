import { useEffect, useState } from 'react'

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  )

  useEffect(() => {
    let timeoutId: number | undefined

    const onResize = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        setIsMobile(window.innerWidth < breakpoint)
      }, 120)
    }

    window.addEventListener('resize', onResize)
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      window.removeEventListener('resize', onResize)
    }
  }, [breakpoint])

  return isMobile
}
