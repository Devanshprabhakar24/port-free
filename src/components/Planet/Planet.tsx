import { memo } from 'react'

type PlanetProps = {
  color: string
  glow: string
  size: number
  cx: number
  cy: number
  ring?: boolean
  tilt?: number
  label?: string
  localT: number
  bands?: boolean
  earth?: boolean
}

function Planet({ color, glow, size, cx, cy, ring, tilt = -15, label, localT, bands, earth }: PlanetProps) {
  const opacity = localT < 0.35
    ? 0.4 + (localT / 0.35) * 0.6
    : localT < 0.55
      ? 1.0
      : localT < 0.75
        ? 1.0 - ((localT - 0.55) / 0.20) * 0.3
        : Math.max(0, 0.7 - ((localT - 0.75) / 0.25) * 0.7)

  const blurPx = localT < 0.55
    ? 0
    : localT < 0.75
      ? ((localT - 0.55) / 0.20) * 2
      : 2 + ((localT - 0.75) / 0.25) * 12

  const brightness = localT < 0.5 ? 0.5 + localT * 1.0 : 1.0
  const saturation = localT < 0.5 ? 0.5 + localT * 0.7 : 1.05

  const d140 = Math.pow(Math.min(localT / 0.5, 1), 1.4)
  const g1 = Math.round(size * 0.04 * d140)
  const g2 = Math.round(size * 0.14 * d140)
  const g3 = Math.round(size * 0.45 * d140)

  const filter = blurPx > 0.3
    ? `blur(${blurPx.toFixed(1)}px) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)})`
    : `brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)})`

  const labelVisible = localT > 0.25 && localT < 0.82
  const labelOpacity = labelVisible
    ? localT < 0.45
      ? (localT - 0.25) / 0.2
      : localT > 0.65
        ? 1 - (localT - 0.65) / 0.17
        : 1
    : 0

  return (
    <div
      aria-hidden="true"
      className="absolute rounded-full will-change-transform"
      style={{
        width: size,
        height: size,
        left: cx - size / 2,
        top: cy - size / 2,
        transition: 'none',
        opacity,
        filter,
        background: [
          'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 36%)',
          'radial-gradient(circle at 68% 72%, rgba(255,255,255,0.07) 0%, transparent 28%)',
          `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(16,12,36,0.92) 68%, rgba(3,1,10,0.98) 100%)`,
        ].join(', '),
        boxShadow: [
          `0 0 ${g1}px ${glow}`,
          `0 0 ${g2}px ${glow}`,
          `0 0 ${g3}px ${glow}`,
          'inset -28px -20px 48px rgba(0,0,0,0.50)',
          'inset 18px 12px 36px rgba(255,255,255,0.09)',
        ].join(', '),
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 36%)',
          opacity: 0.9,
        }}
      />

      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 54%, ${glow} 78%, transparent 100%)`,
          opacity: 0.5 * Math.min(localT / 0.5, 1),
        }}
      />

      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 70% 72%, rgba(0,0,0,0.55) 0%, transparent 55%)',
        }}
      />

      {bands && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {[10, 26, 42, 58, 74].map((top, i) => (
            <div
              key={i}
              className="absolute left-0 right-0"
              style={{
                height: '13%',
                top: `${top}%`,
                background: 'rgba(0,0,0,0.22)',
              }}
            />
          ))}
        </div>
      )}

      {earth && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            className="absolute rounded-full"
            style={{
              background: 'rgba(42,143,58,0.55)',
              width: '35%',
              height: '28%',
              top: '28%',
              left: '18%',
              transform: 'rotate(15deg)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              background: 'rgba(42,143,58,0.55)',
              width: '24%',
              height: '38%',
              top: '20%',
              right: '20%',
              transform: 'rotate(-10deg)',
            }}
          />
        </div>
      )}

      {ring && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            width: size * 1.42,
            height: size * 0.38,
            marginLeft: -(size * 1.42) / 2,
            marginTop: -(size * 0.38) / 2,
            border: `${Math.max(1, size * 0.012)}px solid rgba(210,180,100,0.5)`,
            borderRadius: '50%',
            transform: `rotate(${tilt}deg)`,
            boxShadow: `0 0 ${size * 0.04}px ${glow}`,
            opacity,
          }}
        />
      )}

      {label && labelOpacity > 0 && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono uppercase tracking-[0.28em] text-white/55"
          style={{
            bottom: -Math.max(14, size * 0.045),
            fontSize: Math.max(11, Math.min(22, size * 0.028)),
            opacity: Math.max(0, labelOpacity),
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

export default memo(Planet)