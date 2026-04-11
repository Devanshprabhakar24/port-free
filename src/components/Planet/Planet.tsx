import { memo } from 'react'

type PlanetProps = {
  color: string
  glow: string
  size: number
  x: string
  y: string
  opacity?: number
  ring?: boolean
  tilt?: number
  label?: string
}

function Planet({
  color, glow, size, x, y,
  opacity = 1, ring = false, tilt = -12, label,
}: PlanetProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute rounded-full will-change-transform"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        opacity,
        background: [
          'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.2) 0%, transparent 32%)',
          'radial-gradient(circle at 68% 72%, rgba(255,255,255,0.08) 0%, transparent 30%)',
          `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(16,12,36,0.92) 70%, rgba(3,1,10,0.98) 100%)`,
        ].join(', '),
        boxShadow: [
          `0 0 24px ${glow}`,
          `0 0 80px ${glow}`,
          `0 0 ${Math.round(size * 0.5)}px ${glow}`,
          'inset -28px -20px 48px rgba(0,0,0,0.45)',
          'inset 18px 12px 36px rgba(255,255,255,0.08)',
        ].join(', '),
        filter: 'saturate(1.15)',
      }}
    >
      {/* Specular highlight */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2) 0%, transparent 26%)',
          opacity: 0.8,
        }}
      />
      {/* Atmospheric rim */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 58%, ${glow} 82%, transparent 100%)`,
          opacity: 0.4,
        }}
      />
      {ring && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: size * 1.35,
            height: size * 0.35,
            marginLeft: -(size * 1.35) / 2,
            marginTop: -(size * 0.35) / 2,
            border: '1px solid rgba(167,139,250,0.32)',
            boxShadow: `0 0 22px ${glow}`,
            transform: `rotate(${tilt}deg)`,
          }}
        />
      )}
      {label && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono uppercase tracking-[0.28em] text-white/35"
          style={{
            bottom: -Math.max(10, size * 0.06),
            fontSize: Math.max(8, size * 0.026),
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

export default memo(Planet)