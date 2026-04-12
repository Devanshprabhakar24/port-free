import { lazy, memo, Suspense } from 'react'

const PlanetCanvas = lazy(() => import('./PlanetCanvas'))

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
  const opacity =
    localT < 0.35 ? 0.0 + (localT / 0.35) * 1.0
      : localT < 0.55 ? 1.0
        : localT < 0.75 ? 1.0 - ((localT - 0.55) / 0.20) * 0.40
          : Math.max(0, 0.60 - ((localT - 0.75) / 0.25) * 0.60)

  const blurPx =
    localT < 0.55 ? 0
      : localT < 0.75 ? ((localT - 0.55) / 0.20) * 4
        : 4 + ((localT - 0.75) / 0.25) * 20

  const glowIntensity = Math.pow(Math.min(localT / 0.45, 1), 1.6)
  const glowSpreadPx = Math.round(size * 0.18 * glowIntensity)

  const labelAlpha =
    localT > 0.28 && localT < 0.80
      ? localT < 0.44 ? (localT - 0.28) / 0.16
        : localT > 0.64 ? 1 - (localT - 0.64) / 0.16
          : 1
      : 0

  const shouldRender = localT > 0.05 && localT < 1.10

  const isSaturn = ring && color.toLowerCase() === '#d4b86a'
  const ringBackStroke = isSaturn ? 'rgba(228,202,142,0.26)' : 'rgba(210,180,100,0.28)'
  const ringFrontStroke = isSaturn ? 'rgba(241,219,166,0.52)' : 'rgba(210,180,100,0.50)'
  const ringGlowOuter = isSaturn ? 'rgba(231,208,152,0.24)' : 'rgba(210,180,100,0.25)'
  const ringGlowInner = isSaturn ? 'rgba(240,222,175,0.18)' : 'rgba(210,180,100,0.15)'

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: cx - size / 2,
        top: cy - size / 2,
        transform: `translate3d(0, 0, ${zOffset.toFixed(1)}px) rotateX(${tiltXDeg.toFixed(2)}deg) rotateY(${rotateYDeg.toFixed(2)}deg) rotateZ(${spinDeg.toFixed(2)}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'none',
        willChange: 'transform',
        overflow: 'visible',
      }}
    >
      {shouldRender && (
        <Suspense
          fallback={
            <div
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                opacity,
                background: [
                  'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.18) 0%, transparent 32%)',
                  `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(3,1,10,0.96) 70%)`,
                ].join(', '),
                boxShadow: `0 0 ${glowSpreadPx}px ${glow}`,
              }}
            />
          }
        >
          <PlanetCanvas
            size={size}
            color={color}
            glow={glow}
            earth={earth}
            bands={bands}
            opacity={opacity}
            blurPx={blurPx}
            glowSpreadPx={glowSpreadPx}
            localT={localT}
          />
        </Suspense>
      )}

      {ring && opacity > 0.02 && (
        <>
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              left: '50%',
              top: '50%',
              width: size * 2.35,
              height: size * 0.52,
              marginLeft: -(size * 2.35) / 2,
              marginTop: -(size * 0.52) / 2,
              borderRadius: '50%',
              border: `${Math.max(2, size * 0.016)}px solid ${ringBackStroke}`,
              transform: `rotate(${tilt}deg)`,
              opacity: opacity * 0.66,
              zIndex: -1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              left: '50%',
              top: '50%',
              width: size * 2.35,
              height: size * 0.52,
              marginLeft: -(size * 2.35) / 2,
              marginTop: -(size * 0.52) / 2,
              borderRadius: '50%',
              border: `${Math.max(2, size * 0.022)}px solid ${ringFrontStroke}`,
              boxShadow: `0 0 ${size * 0.05}px ${ringGlowOuter}, inset 0 0 ${size * 0.03}px ${ringGlowInner}`,
              transform: `rotate(${tilt}deg)`,
              opacity: opacity * 0.84,
              zIndex: 1,
            }}
          />
        </>
      )}

      {labelAlpha > 0.01 && (
        <div
          style={{
            position: 'absolute',
            bottom: -Math.max(16, size * 0.048),
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.30em',
            fontSize: Math.max(10, Math.min(18, size * 0.025)),
            color: 'rgba(255,255,255,0.48)',
            opacity: labelAlpha * 0.72,
            pointerEvents: 'none',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

export default memo(Planet)
