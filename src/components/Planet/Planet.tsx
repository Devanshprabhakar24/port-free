import { memo, lazy, Suspense } from 'react'

const PlanetMesh = lazy(() => import('./PlanetMesh'))

// Map planet characteristics to shader type
// 0=generic, 1=earth, 2=gas_bands (Jupiter/Saturn), 3=rocky (Mercury/Mars/Venus)
function getPlanetType(earth?: boolean, bands?: boolean, color?: string): 0 | 1 | 2 | 3 {
  if (earth) return 1
  if (bands) return 2
  // Rocky: Mercury (gray), Mars (red-orange), Venus (golden)
  if (color) {
    if (color.startsWith('#88') || color.startsWith('#c1') || color.startsWith('#c8')) return 3
  }
  return 0
}

type PlanetProps = {
  color: string
  glow: string
  size: number
  cx: number
  cy: number
  zOffset?: number
  tiltXDeg?: number
  rotateYDeg?: number
  spinDeg?: number
  ring?: boolean
  tilt?: number
  label?: string
  localT: number
  bands?: boolean
  earth?: boolean
}

function Planet({
  color,
  glow,
  size,
  cx,
  cy,
  zOffset = 0,
  tiltXDeg = 0,
  rotateYDeg = 0,
  spinDeg = 0,
  ring,
  tilt = -15,
  label,
  localT,
  bands,
  earth,
}: PlanetProps) {
  const opacity = localT < 0.35
    ? 0.2 + (localT / 0.35) * 0.8
    : localT < 0.55
      ? 1.0
      : localT < 0.75
        ? 1.0 - ((localT - 0.55) / 0.20) * 0.35
        : Math.max(0, 0.65 - ((localT - 0.75) / 0.25) * 0.65)

  const blurPx = localT < 0.55
    ? 0
    : localT < 0.75
      ? ((localT - 0.55) / 0.20) * 3
      : 3 + ((localT - 0.75) / 0.25) * 18

  const glowIntensity = Math.pow(Math.min(localT / 0.5, 1), 1.4)

  const labelVisible = localT > 0.25 && localT < 0.82
  const labelOpacity = labelVisible
    ? localT < 0.45
      ? (localT - 0.25) / 0.2
      : localT > 0.65
        ? 1 - (localT - 0.65) / 0.17
        : 1
    : 0

  const planetType = getPlanetType(earth, bands, color)

  // Rotation speeds: Earth fast, gas giants medium, rocky slow
  const rotationSpeed = earth ? 1.8 : bands ? 0.9 : 0.5

  return (
    <div
      aria-hidden="true"
      className="absolute will-change-transform"
      style={{
        width: size,
        height: size,
        left: cx - size / 2,
        top: cy - size / 2,
        transform: `translate3d(0, 0, ${zOffset.toFixed(1)}px) rotateX(${tiltXDeg.toFixed(2)}deg) rotateY(${rotateYDeg.toFixed(2)}deg) rotateZ(${spinDeg.toFixed(2)}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'none',
        filter: blurPx > 0.3 ? `blur(${blurPx.toFixed(1)}px)` : undefined,
      }}
    >
      <Suspense
        fallback={(
          <div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              opacity,
              background: [
                'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.24) 0%, transparent 34%)',
                `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(3,1,10,0.95) 74%, rgba(1,1,6,0.98) 100%)`,
              ].join(', '),
              boxShadow: `0 0 ${Math.max(10, size * 0.16)}px ${glow}`,
            }}
          />
        )}
      >
        <PlanetMesh
          size={size}
          color={color}
          glow={glow}
          glowColor={glow}
          planetType={planetType}
          rotationSpeed={rotationSpeed}
          opacity={opacity}
          glowIntensity={glowIntensity}
        />
      </Suspense>

      {ring && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: '50%',
            top: '50%',
            width: size * 2.2,
            height: size * 0.48,
            marginLeft: -(size * 2.2) / 2,
            marginTop: -(size * 0.48) / 2,
            borderRadius: '50%',
            border: `${Math.max(2, size * 0.018)}px solid rgba(210,180,100,0.45)`,
            boxShadow: [
              `0 0 ${size * 0.06}px rgba(210,180,100,0.3)`,
              `inset 0 0 ${size * 0.04}px rgba(210,180,100,0.2)`,
            ].join(', '),
            transform: `rotate(${tilt}deg)`,
            opacity: opacity * 0.9,
          }}
        />
      )}

      {label && labelOpacity > 0 && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono uppercase tracking-[0.28em] text-white/55"
          style={{
            bottom: -Math.max(16, size * 0.05),
            fontSize: Math.max(11, Math.min(20, size * 0.026)),
            opacity: Math.max(0, labelOpacity * 0.65),
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

export default memo(Planet)
