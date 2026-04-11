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
  depth?: number  // 0.0 far -> 1.0 centered
  isFocused?: boolean
}

function Planet({
  color, glow, size, x, y,
  ring = false, tilt = -12, label, depth = 1, isFocused = true,
}: PlanetProps) {
  // Power-curve easing - not linear
  const d65  = Math.pow(depth, 0.65)  // scale, blur: easeOut -> planet rushes forward
  const d45  = Math.pow(depth, 0.45)  // opacity: reveals BEFORE scale completes
  const d140 = Math.pow(depth, 1.4)   // glow: only blooms when very close

  const scale      = 0.22 + d65 * 0.78         // 0.22 far -> 1.0 close
  const opacity    = 0.06 + d45 * 0.94         // 0.06 far -> 1.0 close
  const blurPx     = (1 - d65) * 22            // 22px far -> 0px close
  const brightness = 0.4  + depth * 0.6        // dim far -> vivid close
  const saturation = 0.45 + depth * 0.65       // grey far -> saturated close

  const filterStr = blurPx > 0.4
    ? `blur(${blurPx.toFixed(2)}px) brightness(${brightness.toFixed(3)}) saturate(${saturation.toFixed(3)})`
    : `brightness(${brightness.toFixed(3)}) saturate(${saturation.toFixed(3)})`

  return (
    <div
      aria-hidden="true"
      className="absolute rounded-full will-change-transform"
      style={{
        left: x, top: y,
        width: size, height: size,
        marginLeft: -size / 2, marginTop: -size / 2,
        transform: `scale(${scale.toFixed(4)})`,
        opacity,
        filter: filterStr,
        transition: 'none',  // CRITICAL: scroll drives this, CSS must not fight it
        background: [
          'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.22) 0%, transparent 32%)',
          'radial-gradient(circle at 68% 72%, rgba(255,255,255,0.09) 0%, transparent 30%)',
          `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(16,12,36,0.92) 70%, rgba(3,1,10,0.98) 100%)`,
        ].join(', '),
        boxShadow: [
          // d140 curve: glow only blooms when depth is high - no halos on distant planets
          `0 0 ${Math.round(size * 0.04 * d140)}px ${glow}`,
          `0 0 ${Math.round(size * 0.16 * d140)}px ${glow}`,
          `0 0 ${Math.round(size * 0.55 * d140)}px ${glow}`,
          'inset -28px -20px 48px rgba(0,0,0,0.50)',
          'inset 18px 12px 36px rgba(255,255,255,0.09)',
        ].join(', '),
      }}
    >
      {/* Specular highlight */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle at 34% 29%, rgba(255,255,255,0.22) 0%, transparent 28%)',
        opacity: 0.85,
      }} />
      {/* Atmospheric rim - grows with depth */}
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle at 50% 50%, transparent 56%, ${glow} 80%, transparent 100%)`,
        opacity: 0.45 * depth,
      }} />
      {/* Corona - only on focused planet */}
      {isFocused && (
        <div className="absolute inset-0 rounded-full" style={{
          background: `radial-gradient(circle at 50% 50%, transparent 60%, ${glow} 88%, transparent 100%)`,
          opacity: 0.25 * depth,
        }} />
      )}
      {/* Ring */}
      {ring && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: size * 1.38, height: size * 0.36,
            marginLeft: -(size * 1.38) / 2,
            marginTop:  -(size * 0.36) / 2,
            border: '1px solid rgba(167,139,250,0.34)',
            filter: `blur(${((1 - depth) * 3).toFixed(1)}px)`,
            boxShadow: `0 0 22px ${glow}`,
            transform: `rotate(${tilt}deg)`,
            opacity: depth,
          }}
        />
      )}
      {/* Label */}
      {label && isFocused && depth > 0.72 && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono uppercase tracking-[0.28em] text-white/35"
          style={{
            bottom: -Math.max(10, size * 0.06),
            fontSize: Math.max(8, size * 0.026),
            whiteSpace: 'nowrap',
            opacity: Math.max(0, (depth - 0.72) / 0.28),
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

export default memo(Planet)