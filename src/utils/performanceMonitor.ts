/**
 * Performance monitoring utility for tracking FPS and render performance
 * Useful for debugging mobile performance issues
 */

interface PerformanceStats {
  fps: number
  frameTime: number
  memory?: number
}

class PerformanceMonitor {
  private frames: number[] = []
  private lastTime = performance.now()
  private enabled = false

  enable() {
    this.enabled = true
    console.log('Performance monitoring enabled')
  }

  disable() {
    this.enabled = false
    this.frames = []
  }

  update(): PerformanceStats | null {
    if (!this.enabled) return null

    const now = performance.now()
    const delta = now - this.lastTime
    this.lastTime = now

    this.frames.push(delta)
    if (this.frames.length > 60) {
      this.frames.shift()
    }

    const avgFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length
    const fps = Math.round(1000 / avgFrameTime)

    const stats: PerformanceStats = {
      fps,
      frameTime: Math.round(avgFrameTime * 100) / 100,
    }

    // Add memory info if available
    if ('memory' in performance) {
      const memory = (performance as any).memory
      stats.memory = Math.round(memory.usedJSHeapSize / 1048576) // MB
    }

    return stats
  }

  logStats() {
    const stats = this.update()
    if (stats) {
      const memoryStr = stats.memory ? ` | Memory: ${stats.memory}MB` : ''
      console.log(`FPS: ${stats.fps} | Frame Time: ${stats.frameTime}ms${memoryStr}`)
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Enable in development or when URL contains ?debug=performance
if (import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === 'performance') {
  performanceMonitor.enable()
  
  // Log stats every 2 seconds
  setInterval(() => {
    performanceMonitor.logStats()
  }, 2000)
}
