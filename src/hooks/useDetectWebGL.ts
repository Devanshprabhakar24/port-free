import { useState } from 'react'

export function useDetectWebGL() {
  const [isWebGLAvailable] = useState(() => {
    const canvas = document.createElement('canvas')
    const context =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')

    return Boolean(context)
  })

  return isWebGLAvailable
}
