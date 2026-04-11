import { memo } from 'react'

type PlanetProps = {
  color: string
  glow: string
  size: number
  x: string
  y: string
  ring?: boolean
  tilt?: number
  label?: string
  depth?: number // 0.0 far -> 1.0 centered (default 1)
  isFocused?: boolean // is this the currently active section
}

function Planet({
  color,
  glow,
  size,
  x,
  y,
  ring = false,
  tilt = -12,
  label,
  depth = 1,
  isFocused = true,
}: PlanetProps) {
  const d65 = Math.pow(depth, 0.65)
  const d45 = Math.pow(depth, 0.45)
  const d140 = Math.pow(depth, 1.4)

  const scale = 0.22 + d65 * 0.78
  const opacity = 0.06 + d45 * 0.94
  const blurPx = (1 - d65) * 22
  const brightness = 0.4 + depth * 0.6
  const saturation = 0.45 + depth * 0.65
  const outerGlow = size * (0.3 + d140 * 0.5)
  const ringBlur = (1 - depth) * 4

  return (
    <div
      aria-hidden="true"
      className="absolute rounded-full will-change-transform"
      style={{
        left: x,
        top: y,
        width: size, // keep layout size constant
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        // Apply depth as CSS transform - GPU composited, no layout
        transform: `scale(${scale.toFixed(4)})`,
        opacity,
        filter:
          blurPx > 0.5
            ? `blur(${blurPx.toFixed(2)}px) brightness(${brightness.toFixed(3)}) saturate(${saturation.toFixed(3)})`
            : `brightness(${brightness.toFixed(3)}) saturate(${saturation.toFixed(3)})`,
        transition: 'none', // CRITICAL: no CSS transition, scroll drives it
        background: [
          'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.2) 0%, transparent 32%)',
          'radial-gradient(circle at 68% 72%, rgba(255,255,255,0.08) 0%, transparent 30%)',
          `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(16,12,36,0.92) 70%, rgba(3,1,10,0.98) 100%)`,
        ].join(', '),
        boxShadow: [
          `0 0 ${Math.round(size * 0.04 * d140)}px ${glow}`,
          `0 0 ${Math.round(size * 0.14 * d140)}px ${glow}`,
          `0 0 ${Math.round(outerGlow)}px ${glow}`,
          `0 0 ${Math.round(size * 0.2)}px rgba(255,255,255,${(0.05 * depth).toFixed(3)})`,
          'inset -28px -20px 48px rgba(0,0,0,0.45)',
          'inset 18px 12px 36px rgba(255,255,255,0.08)',
        ].join(', '),
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
          opacity: 0.4 * depth,
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
            opacity: depth,
            filter: ringBlur > 0.2 ? `blur(${ringBlur.toFixed(2)}px)` : 'none',
          }}
        />
      )}
      {label && isFocused && depth > 0.7 && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono uppercase tracking-[0.28em] text-white/35"
          style={{
            bottom: -Math.max(10, size * 0.06),
            fontSize: Math.max(8, size * 0.026),
            whiteSpace: 'nowrap',
            opacity: Math.max(0, (depth - 0.7) / 0.3), // fades in only when close
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

export default memo(Planet)