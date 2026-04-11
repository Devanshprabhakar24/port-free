// 4 ambient orbiter planets - fixed depth, no scroll-driven changes

export type OrbiterConfig = {
  id: string
  color: string
  glow: string
  size: number
  x: string
  y: string
  ring?: boolean
  tilt?: number
  baseDepth: number   // permanent depth 0.15-0.25, never changes with scroll
  floatAmpX: number   // ambient float amplitude X (px)
  floatAmpY: number   // ambient float amplitude Y (px)
  floatDuration: number
  floatDelay: number
}

export const AMBIENT_ORBITERS: OrbiterConfig[] = [
  {
    id: 'orbiter-alpha',
    color: '#0a1a3a', glow: 'rgba(56,189,248,0.22)',
    size: 160, x: '18%', y: '55%',
    baseDepth: 0.22, floatAmpX: 8, floatAmpY: 12,
    floatDuration: 22, floatDelay: 0,
  },
  {
    id: 'orbiter-beta',
    color: '#1a0a2e', glow: 'rgba(168,85,247,0.18)',
    size: 110, x: '88%', y: '72%',
    baseDepth: 0.18, floatAmpX: 6, floatAmpY: 9,
    floatDuration: 28, floatDelay: 4,
  },
  {
    id: 'orbiter-gamma',
    color: '#0a2018', glow: 'rgba(52,211,153,0.16)',
    size: 85, x: '8%', y: '22%',
    baseDepth: 0.15, floatAmpX: 5, floatAmpY: 7,
    floatDuration: 19, floatDelay: 8,
  },
  {
    id: 'orbiter-delta',
    color: '#200a0a', glow: 'rgba(251,113,133,0.14)',
    size: 140, x: '62%', y: '88%',
    baseDepth: 0.20, floatAmpX: 10, floatAmpY: 6,
    floatDuration: 32, floatDelay: 12,
  },
]
