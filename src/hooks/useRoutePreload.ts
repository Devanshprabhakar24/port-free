import { useEffect } from 'react'

// ⚡ OPTIMIZATION: Preload route bundles on hover to eliminate loading delay
// When user hovers over a nav link, chunk is fetched in background
const routeChunks: Record<string, () => Promise<any>> = {
  '/': () => import('../pages/Home'),
  '/about': () => import('../pages/About'),
  '/dashboard': () => import('../pages/Dashboard'),
  '/projects': () => import('../pages/Projects'),
  '/contact': () => import('../pages/Contact'),
}

let preloadQueue = new Set<string>()

export const preloadRouteChunk = (path: string) => {
  if (preloadQueue.has(path) || !routeChunks[path]) {
    return
  }

  preloadQueue.add(path)

  // Use requestIdleCallback for non-blocking preload
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routeChunks[path]?.()
        .catch(() => {
          // Silently fail - user will still get page on click
        })
        .finally(() => {
          preloadQueue.delete(path)
        })
    })
  } else {
    // Fallback to setTimeout
    setTimeout(() => {
      routeChunks[path]?.()
        .catch(() => {
          // Silently fail
        })
        .finally(() => {
          preloadQueue.delete(path)
        })
    }, 300)
  }
}

export function useRoutePreload() {
  useEffect(() => {
    // Preload all route chunks on mount
    Object.keys(routeChunks).forEach((path) => {
      preloadRouteChunk(path)
    })
  }, [])

  return preloadRouteChunk
}
