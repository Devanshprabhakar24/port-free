import { memo } from 'react'
import { motion } from 'framer-motion'

type PlanetProps = {
  layoutId: string
  layout?: 'position' | boolean
  color: string
  glow: string
  size: number
  x: string
  y: string
  opacity?: number
  ring?: boolean
  tilt?: number
  label?: string
  isActive?: boolean
}

function Planet({ layoutId, layout = 'position', color, glow, size, x, y, opacity = 1, ring = false, tilt = -12, label, isActive = true }: PlanetProps) {
  return (
    <motion.div
      layoutId={layoutId}
      layout={layout}
      aria-hidden="true"
      className="absolute rounded-full will-change-transform"
      initial={false}
      animate={
        isActive
          ? {
              opacity,
              x: [0, 3],
              y: [0, -4],
              scale: [1, 1.02],
            }
          : {
              opacity,
              x: 0,
              y: 0,
              scale: 1,
            }
      }
      transition={isActive ? { duration: 14, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' } : { duration: 0.2 }}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.2) 0%, transparent 32%), radial-gradient(circle at 68% 72%, rgba(255,255,255,0.08) 0%, transparent 30%), radial-gradient(circle at 50% 50%, ${color} 0%, rgba(16,12,36,0.92) 70%, rgba(3,1,10,0.98) 100%)`,
        boxShadow: `0 0 24px ${glow}, 0 0 80px ${glow}, inset -28px -20px 48px rgba(0,0,0,0.45), inset 18px 12px 36px rgba(255,255,255,0.08)`,
        filter: 'saturate(1.15)',
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2) 0%, transparent 26%)',
          opacity: 0.8,
        }}
      />
      {ring ? (
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
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
      ) : null}
      {label ? (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">
          {label}
        </div>
      ) : null}
    </motion.div>
  )
}

export default memo(Planet)