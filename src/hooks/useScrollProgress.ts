import { useEffect, useState } from 'react'

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculate = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const next = scrollable <= 0 ? 0 : window.scrollY / scrollable
      setProgress(Math.max(0, Math.min(1, next)))
    }

    calculate()
    window.addEventListener('scroll', calculate, { passive: true })
    window.addEventListener('resize', calculate)

    return () => {
      window.removeEventListener('scroll', calculate)
      window.removeEventListener('resize', calculate)
    }
  }, [])

  return progress
}
