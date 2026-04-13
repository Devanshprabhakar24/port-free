/**
 * Device capability detection for adaptive quality settings
 */

export interface DeviceCapabilities {
  isMobile: boolean
  isLowEnd: boolean
  maxTextureSize: number
  supportsWebGL2: boolean
  devicePixelRatio: number
  recommendedDPR: number
  recommendedGeometryDetail: 'low' | 'medium' | 'high'
}

function detectWebGLCapabilities(): { maxTextureSize: number; supportsWebGL2: boolean } {
  const canvas = document.createElement('canvas')
  
  // Try WebGL2 first
  const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null
  if (gl2) {
    const maxTextureSize = gl2.getParameter(gl2.MAX_TEXTURE_SIZE) as number
    return { maxTextureSize, supportsWebGL2: true }
  }
  
  // Fall back to WebGL1
  const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
  if (!gl) {
    return { maxTextureSize: 2048, supportsWebGL2: false }
  }
  
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
  return { maxTextureSize, supportsWebGL2: false }
}

function isLowEndDevice(): boolean {
  // Check for low-end indicators
  const ua = navigator.userAgent.toLowerCase()
  
  // Low-end Android devices
  if (ua.includes('android')) {
    // Check for low RAM indicators
    if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
      return true
    }
    
    // Old Android versions
    const androidVersion = ua.match(/android (\d+)/)
    if (androidVersion && parseInt(androidVersion[1]) < 10) {
      return true
    }
  }
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true
  }
  
  return false
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768
  const isLowEnd = isLowEndDevice()
  const { maxTextureSize, supportsWebGL2 } = detectWebGLCapabilities()
  const devicePixelRatio = window.devicePixelRatio || 1
  
  // Recommend DPR based on device capabilities
  let recommendedDPR = 1
  if (!isMobile && !isLowEnd) {
    recommendedDPR = Math.min(devicePixelRatio, 1.5)
  } else if (isMobile && !isLowEnd) {
    recommendedDPR = 1
  } else {
    recommendedDPR = 1 // Low-end devices always use 1x
  }
  
  // Recommend geometry detail level
  let recommendedGeometryDetail: 'low' | 'medium' | 'high' = 'medium'
  if (isLowEnd) {
    recommendedGeometryDetail = 'low'
  } else if (!isMobile && supportsWebGL2) {
    recommendedGeometryDetail = 'high'
  }
  
  return {
    isMobile,
    isLowEnd,
    maxTextureSize,
    supportsWebGL2,
    devicePixelRatio,
    recommendedDPR,
    recommendedGeometryDetail,
  }
}

// Cache the capabilities
let cachedCapabilities: DeviceCapabilities | null = null

export function getDeviceCapabilities(): DeviceCapabilities {
  if (!cachedCapabilities) {
    cachedCapabilities = detectDeviceCapabilities()
    
    // Log capabilities in development
    if (import.meta.env.DEV) {
      console.log('Device Capabilities:', cachedCapabilities)
    }
  }
  
  return cachedCapabilities
}
